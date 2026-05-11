import {
  calculateUnhousedScore,
  calculateDependentsScore,
  calculateSubscriptionScore,
  calculateTotalScore,
} from './calculator';

describe('Cheong-yak Calculator', () => {
  describe('Unhoused Score', () => {
    test('less than 1 year should be 2', () => {
      expect(calculateUnhousedScore(0.5)).toBe(2);
    });
    test('1 year should be 4', () => {
      expect(calculateUnhousedScore(1)).toBe(4);
    });
    test('14 years should be 30', () => {
      expect(calculateUnhousedScore(14)).toBe(30);
    });
    test('15 years or more should be 32', () => {
      expect(calculateUnhousedScore(15)).toBe(32);
      expect(calculateUnhousedScore(20)).toBe(32);
    });
  });

  describe('Dependents Score', () => {
    test('0 dependents should be 5', () => {
      expect(calculateDependentsScore(0)).toBe(5);
    });
    test('3 dependents should be 20', () => {
      expect(calculateDependentsScore(3)).toBe(20);
    });
    test('6 or more dependents should be 35', () => {
      expect(calculateDependentsScore(6)).toBe(35);
      expect(calculateDependentsScore(10)).toBe(35);
    });
  });

  describe('Subscription Score', () => {
    test('less than 6 months should be 1', () => {
      expect(calculateSubscriptionScore(0.4)).toBe(1);
    });
    test('6 months to 1 year should be 2', () => {
      expect(calculateSubscriptionScore(0.7)).toBe(2);
    });
    test('1 year should be 3', () => {
      expect(calculateSubscriptionScore(1)).toBe(3);
    });
    test('14 years should be 16', () => {
      expect(calculateSubscriptionScore(14)).toBe(16);
    });
    test('15 years or more should be 17', () => {
      expect(calculateSubscriptionScore(15)).toBe(17);
      expect(calculateSubscriptionScore(20)).toBe(17);
    });
  });

  describe('Total Score', () => {
    test('max score should be 84', () => {
      const result = calculateTotalScore(15, 6, 15);
      expect(result.totalScore).toBe(84);
    });
    test('min score should be 8', () => {
      // Unhoused < 1 yr: 2
      // Dependents 0: 5
      // Subscription < 6 months: 1
      // Total: 8
      const result = calculateTotalScore(0, 0, 0);
      expect(result.totalScore).toBe(8);
    });
  });
});
