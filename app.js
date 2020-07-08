"use strict";
(function(){
  /**
   * UTILITY FUNCTIONS
   */

   /**
    * Randomly shuffles an array
    * Originally from https://stackoverflow.com/a/2450976
    * @param {Array} array array to shuffle
    * @reutns shuffled array
    */
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  /**
   * Randomly select an element from an array
   * Does not affect the original array
   * @param {Array} array array to select from
   * @returns randomly selected array element
   */
  function randomSelect(array) {
    let index = Math.floor(Math.random() * array.length);
    return array[index];
  }

  /**
   * Generates a random political compass point where each axis can be between -10 and 10
   * @returns random political compass point
   */
  function randomCompass() {
    return new Point(Math.random() * 20 - 10, Math.random() * 20 - 10);
  }

  /**
   * Round a number to 2 decimal places
   * @param {Number} number to round
   * @returns rounded number
   */
  function round(num) {
    return Math.round(num * 100) / 100
  }

  /**
   * Represents a point on a political compass
   */
  class Point {
    /**
     * Creates a new point
     * @param {Number} x x coordinate
     * @param {Number} y y coordinate
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    /**
     * Get the distance of this point to another point
     * @param {Point} point the point to find the distance to
     * @returns the distance of this point to the provided point
     */
    distanceTo(point) {
      let x1 = this.x;
      let y1 = this.y;
      let x2 = point.x;
      let y2 = point.y;
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
  }

  /**
   * "Abstract" superclass of Party and Legislator, which both have names, compass, and issues
   */
  class PoliticalActor {
    /**
     * Creates a new PoliticalActor
     * @param {String}  name    name
     * @param {Point}   compass political compass
     * @param {Array}   issues  issues this actor identifies with
     */
    constructor(name, compass, issues) {
      this.name = name;
      this.compass = compass;
      this.issues = [...new Set(issues)]; // removes dupes
    }
  } 

  /**
   * Represents a political party
   */
  class Party extends PoliticalActor {
    /**
     * Creates a new party
     * @param {String}  name    party name
     * @param {String}  color   display color
     * @param {Point}   compass political compass
     * @param {Array}   issues  issues this party identifies with
     */
    constructor(name, color, compass, issues) {
      super(name, compass, issues);
      this.color = color;
    }
  }

  /**
   * Represents a legislator
   */
  class Legislator extends PoliticalActor {
    /**
     * Creates a new legislator
     * @param {String}  name    legislator name
     * @param {Party}   party   party this legislator is a member of
     * @param {Point}   compass political compass
     * @param {Array}   issues  issues this legislator identifies with
     */
    constructor(name, party, compass, issues) {
      super(name, compass, issues);
      this.party = party;
      this.billsIntroduced = [];
      this.voteHistory = [];
    }
  }

  /**
   * Represents a legislature along with its legislators and parties
   */
  class Legislature {
    /**
     * Creates a new legislature
     * @param {Array}   legislatorNames all legislator names possible to choose from
     * @param {Array}   partyNames      all party names possible to choose from
     * @param {Array}   colors          all party colors possible to choose from
     * @param {Array}   issues          all issues possible to identify with
     * @param {Number}  size            number of legislators in the legislature
     * @param {Number}  numParties      number of parties in the legislature
     * @param {Number}  issueSelections number of times a legislator/party should select issues
     */
    constructor(legislatorNames, partyNames, colors, issues, size, numParties, issueSelections) {
      legislatorNames = shuffle(legislatorNames);
      partyNames = shuffle(partyNames);
      colors = shuffle(colors);
      this.issues = issues;
      this.issueSelections = issueSelections;
      this.parties = this.generateParties(partyNames, colors, numParties);
      this.legislators = this.generateLegislators(legislatorNames, size, issueSelections);
    }

    /**
     * Randomly generates new parties
     * @param {Array}   names       all party names possible to choose from
     * @param {Array}   colors      all party colors possible to choose from
     * @param {Number}  numParties  number of parties in the legislature
     * @return {Array} a list of parties in this legislature
     */
    generateParties(names, colors, numParties) {
      let parties = [];
      for (let i = 0; i < numParties; i++) {
        let partyIssues = [];
        for (let issueNo = 0; issueNo < this.issueSelections; issueNo++) {
          partyIssues.push(randomSelect(this.issues));
        }
        parties.push(new Party(
          names[i % names.length] + " Party",
          colors[i % colors.length],
          randomCompass(),
          partyIssues
          ));
      }
      return parties;
    }

    /**
     * Randomly generates new legislators and assigns them to parties
     * @param {Array}   names           all legislator names possible to choose from
     * @param {Number}  numLegislators  number of legislators in the legislature
     * @return {Array} a list of legislators in this legislature
     */
    generateLegislators(names, numLegislators) {
      let legislators = [];
      for (let i = 0; i < numLegislators; i++) {
        let compass = randomCompass();
        let party = this.parties.reduce( (party1, party2) => { // choose party with closest compass
          return compass.distanceTo(party1.compass) < compass.distanceTo(party2.compass) ? party1 : party2;
        });
        let myIssues = [];
        for (let issueNo = 0; issueNo < this.issueSelections; issueNo++) {
          myIssues.push(randomSelect(this.issues));
        }
        myIssues = myIssues.concat(party.issues);
        legislators.push(new Legislator(names[i % names.length], party, compass, myIssues));
      }
      return legislators;
    }
  }

  window.addEventListener("load", init);

  function init() {
    let currentLegislature = new Legislature(
      ["Alice", "Bob", "Carol"],
      ["Asteroid", "Billiards", "Crevice"],
      ["red", "green", "blue"],
      ["Healthcare", "Military", "Housing"],
      10,
      3,
      1
    );
    updateChart(currentLegislature);
  }

  /**
   * Updates the legislature chart with the legislature info
   * @param {Legislature} legislature the legislature to take info from
   */
  function updateChart(legislature) {
    let chart = document.getElementById("chart");
    for (let legislator of legislature.legislators) {
      let square = document.createElement("div");
      square.classList.add("chart-square");
      square.style.backgroundColor = legislator.party.color;
      square.addEventListener("click", () => showLegislatorInfo(legislator));
      chart.appendChild(square);
    }
  }

  /**
   * Shows the legislator's info in the sidebar
   * Also updates the party tab with the legislator's party info
   * @param {Legislator} legislator legislator to show info about
   */
  function showLegislatorInfo(legislator) {
    console.log(legislator);
    document.getElementById("legislator-name").textContent = legislator.name;
    document.getElementById("legislator-party").textContent = legislator.party.name;
    document.getElementById("legislator-party").style.color = legislator.party.color;
    document.getElementById("legislator-x").textContent = round(legislator.compass.x);
    document.getElementById("legislator-y").textContent = round(legislator.compass.y);

    showPartyInfo(legislator.party);
  }

  /**
   * Shows the party's info in the sidebar
   * @param {Party} party party to show info about
   */
  function showPartyInfo(party) {
    document.getElementById("party-name").textContent = party.name;
    document.getElementById("party-name").style.color = party.color;
    document.getElementById("party-x").textContent = round(party.compass.x);
    document.getElementById("party-y").textContent = round(party.compass.y);
  }

  /**
   * Logs text in the log sidebar
   * @param {String} text text to log
   */
  function log(text) {
    let entry = document.createElement("li");
    entry.textContent = text;
    document.getElementById("log").appendChild(entry);
  }
})();