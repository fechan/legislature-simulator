"use strict";
(function(){
  /**
   * UTILITY FUNCTIONS
   */

   /**
    * Pop a random element from an array
    * @param {Array} array array to pop from
    */
  function randomPop(array) {
    let index = Math.floor(Math.random() * array.length);
    return array.splice(index, 1)[0];
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
      this.issues = issues;
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
     */
    constructor(legislatorNames, partyNames, colors, size, numParties) {
      this.parties = this.generateParties(partyNames, colors, numParties);
      //this.legislators = this.generateLegislators(legislatorNames, size);
    }

    /**
     * Randomly generates new parties
     * @param {Array}   partyNames  all party names possible to choose from
     * @param {Array}   colors      all party colors possible to choose from
     * @param {Number}  numParties  number of parties in the legislature
     * @return {Array} a list of parties in this legislature
     */
    generateParties(partyNames, colors, numParties) {
      let parties = [];
      let names = [...partyNames]; // we don't want to alter the master lists of names and colors
      let palette = [...colors];
      for (let i = 0; i < numParties; i++) {
        parties.push(new Party(randomPop(names) + " Party", randomPop(palette), new Point(1, 1)));
      }
      console.log(parties);
      return parties;
    }

    /**
     * Randomly generates new legislators and assigns them to parties
     * @param {Array}   parties         all parties possible for legislators to be a part of
     * @param {Array}   legislatorNames all legislator names possible to choose from
     * @param {Number}  numLegislators  number of legislators in the legislature
     * @return {Array} a list of legislators in this legislature
     */
    generateLegislators(parties, legislatorNames, numLegislators) {
      let legislators = [];
      let names = [...legislatorNames];
      for (let i = 0; i < numLegislators; i++) {
        let compass = new Point(Math.random() * 10, Math.random() * 10);
        let party = compass.distanceTo
        legislators.push(new Legislator(randomPop(names)))
      }
    }
  }

  window.addEventListener("load", init);

  function init() {
    let currentLegislature = new Legislature(
      ["Alice", "Bob", "Carol"],
      ["Asteroid", "Billiards", "Crevice"],
      ["red", "green", "blue"],
      3,
      3
    );
  }
})();