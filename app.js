"use strict";
(function(){
  /**
   * Represents a legislature along with its legislators and parties
   */
  class Legislature {
    /**
     * Creates a new legislature
     * @param {Legislator}  legislators legislators in this legislature
     * @param {Party}       parties     parties in this legislature
     */
    constructor(legislators, parties) {
      this.legislators = legislators;
      this.parties = parties;
    }
  }

  /**
   * Represents a political party
   */
  class Party {
    /**
     * Creates a new party
     * @param {String}  name    party name
     * @param {String}  color   display color
     * @param {Point}   compass political compass
     */
    constructor(name, color, compass) {
      this.name = name;
      this.color = color;
      this.compass = compass;
    }
  }

  /**
   * Represents a legislator
   */
  class Legislator {
    /**
     * Creates a new legislator
     * @param {String}  name    legislator name
     * @param {String}  color   display color
     * @param {Point}   compass political compass
     */
    constructor(name, color, compass) {
      this.name = name;
      this.color = color;
      this.compass = compass;
      this.billsIntroduced = [];
      this.voteHistory = [];
    }
  }
})();