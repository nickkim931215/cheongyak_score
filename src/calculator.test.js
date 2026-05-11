"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculator_1 = require("./calculator");
describe('Cheong-yak Calculator', () => {
    describe('Unhoused Score', () => {
        test('less than 1 year should be 2', () => {
            expect((0, calculator_1.calculateUnhousedScore)(0.5)).toBe(2);
        });
        test('1 year should be 4', () => {
            expect((0, calculator_1.calculateUnhousedScore)(1)).toBe(4);
        });
        test('14 years should be 30', () => {
            expect((0, calculator_1.calculateUnhousedScore)(14)).toBe(30);
        });
        test('15 years or more should be 32', () => {
            expect((0, calculator_1.calculateUnhousedScore)(15)).toBe(32);
            expect((0, calculator_1.calculateUnhousedScore)(20)).toBe(32);
        });
    });
    describe('Dependents Score', () => {
        test('0 dependents should be 5', () => {
            expect((0, calculator_1.calculateDependentsScore)(0)).toBe(5);
        });
        test('3 dependents should be 20', () => {
            expect((0, calculator_1.calculateDependentsScore)(3)).toBe(20);
        });
        test('6 or more dependents should be 35', () => {
            expect((0, calculator_1.calculateDependentsScore)(6)).toBe(35);
            expect((0, calculator_1.calculateDependentsScore)(10)).toBe(35);
        });
    });
    describe('Subscription Score', () => {
        test('less than 6 months should be 1', () => {
            expect((0, calculator_1.calculateSubscriptionScore)(0.4)).toBe(1);
        });
        test('6 months to 1 year should be 2', () => {
            expect((0, calculator_1.calculateSubscriptionScore)(0.7)).toBe(2);
        });
        test('1 year should be 3', () => {
            expect((0, calculator_1.calculateSubscriptionScore)(1)).toBe(3);
        });
        test('14 years should be 16', () => {
            expect((0, calculator_1.calculateSubscriptionScore)(14)).toBe(16);
        });
        test('15 years or more should be 17', () => {
            expect((0, calculator_1.calculateSubscriptionScore)(15)).toBe(17);
            expect((0, calculator_1.calculateSubscriptionScore)(20)).toBe(17);
        });
    });
    describe('Total Score', () => {
        test('max score should be 84', () => {
            const result = (0, calculator_1.calculateTotalScore)(15, 6, 15);
            expect(result.totalScore).toBe(84);
        });
        test('min score should be 8', () => {
            // Unhoused < 1 yr: 2
            // Dependents 0: 5
            // Subscription < 6 months: 1
            // Total: 8
            const result = (0, calculator_1.calculateTotalScore)(0, 0, 0);
            expect(result.totalScore).toBe(8);
        });
    });
});
//# sourceMappingURL=calculator.test.js.map