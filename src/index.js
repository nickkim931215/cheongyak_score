#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const calculator_1 = require("./calculator");
const program = new commander_1.Command();
program
    .name('cheong-yak-calc')
    .description('CLI to calculate Korean Cheong-yak (apartment subscription) score')
    .version('1.0.0');
program
    .requiredOption('-u, --unhoused <years>', 'Duration of "unhoused" period in years', parseFloat)
    .requiredOption('-f, --family <count>', 'Number of family members (excluding the applicant)', parseInt)
    .requiredOption('-s, --subscription <years>', 'Bank account subscription duration in years', parseFloat)
    .action((options) => {
    const { unhoused, family, subscription } = options;
    const results = (0, calculator_1.calculateTotalScore)(unhoused, family, subscription);
    console.log('\n--- Cheong-yak Score Results ---');
    console.log(`Unhoused Period Score:   ${results.unhousedScore} / 32`);
    console.log(`Family Members Score:    ${results.dependentsScore} / 35`);
    console.log(`Subscription Score:      ${results.subscriptionScore} / 17`);
    console.log('--------------------------------');
    console.log(`Total Score:             ${results.totalScore} / 84\n`);
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map