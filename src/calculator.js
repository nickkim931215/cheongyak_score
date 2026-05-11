"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUnhousedScore = calculateUnhousedScore;
exports.calculateDependentsScore = calculateDependentsScore;
exports.calculateSubscriptionScore = calculateSubscriptionScore;
exports.calculateTotalScore = calculateTotalScore;
function calculateUnhousedScore(years) {
    if (years < 0)
        return 0;
    if (years >= 15)
        return 32;
    return (Math.floor(years) + 1) * 2;
}
function calculateDependentsScore(count) {
    if (count < 0)
        return 0;
    if (count >= 6)
        return 35;
    return (count + 1) * 5;
}
function calculateSubscriptionScore(years) {
    if (years < 0)
        return 0;
    if (years < 0.5)
        return 1;
    if (years < 1)
        return 2;
    if (years >= 15)
        return 17;
    return Math.floor(years) + 2;
}
function calculateTotalScore(unhousedYears, dependentsCount, subscriptionYears) {
    const unhousedScore = calculateUnhousedScore(unhousedYears);
    const dependentsScore = calculateDependentsScore(dependentsCount);
    const subscriptionScore = calculateSubscriptionScore(subscriptionYears);
    return {
        unhousedScore,
        dependentsScore,
        subscriptionScore,
        totalScore: unhousedScore + dependentsScore + subscriptionScore,
    };
}
//# sourceMappingURL=calculator.js.map