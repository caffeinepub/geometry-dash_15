import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type ScoreEntry = {
    player : Principal;
    playerName : ?Text;
    score : Nat;
    timestamp : Time.Time;
  };

  module ScoreEntry {
    public func compareByScore(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      switch (Nat.compare(entry2.score, entry1.score)) {
        case (#equal) {
          Int.compare(entry2.timestamp, entry1.timestamp);
        };
        case (order) { order };
      };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let scores = Map.empty<Principal, [ScoreEntry]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper function to get the minimum of two Nats
  func minimum(a : Nat, b : Nat) : Nat {
    if (a < b) { a } else { b };
  };

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Leaderboard functions
  public shared ({ caller }) func submitScore(playerName : ?Text, score : Nat) : async () {
    // Authorization check: only authenticated users can submit scores
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit scores");
    };

    if (score == 0) {
      Runtime.trap("Score cannot be zero");
    };

    let newScore : ScoreEntry = {
      player = caller;
      playerName;
      score;
      timestamp = Time.now();
    };

    let currentScores = switch (scores.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };

    let updatedScores = currentScores.concat([newScore]);
    scores.add(caller, updatedScores);
  };

  public query ({ caller }) func getTopScoresForPlayer(player : Principal, count : Nat) : async [ScoreEntry] {
    // Public access - anyone can view player scores
    let playerScores = switch (scores.get(player)) {
      case (null) { [] };
      case (?entries) { entries };
    };
    let sortedScores = playerScores.sort(ScoreEntry.compareByScore);
    sortedScores.sliceToArray(0, minimum(count, sortedScores.size()));
  };

  public query ({ caller }) func getTopGlobalScores(count : Nat) : async [ScoreEntry] {
    // Public access - anyone can view global leaderboard
    let allScores = scores.values().flatMap(func(entries) { entries.values() }).toArray();
    let sortedScores = allScores.sort(ScoreEntry.compareByScore);
    sortedScores.sliceToArray(0, minimum(count, sortedScores.size()));
  };

  public query ({ caller }) func getCallerScores() : async [ScoreEntry] {
    // Authorization check: only authenticated users can access their own scores
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access their scores");
    };

    switch (scores.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.sort(ScoreEntry.compareByScore) };
    };
  };

  public query ({ caller }) func getScoreEntriesForPlayer(player : Principal) : async [ScoreEntry] {
    // Public access - anyone can view any player's score entries
    let playerScores = switch (scores.get(player)) {
      case (null) { [] };
      case (?entries) { entries };
    };
    playerScores.sort(ScoreEntry.compareByScore);
  };

  public query ({ caller }) func getAllScores() : async [ScoreEntry] {
    // Admin-only access for viewing all scores across all players
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all scores");
    };

    let allScoresIter = scores.values().flatMap(func(entries) { entries.values() });
    allScoresIter.toArray().sort(ScoreEntry.compareByScore);
  };
};
