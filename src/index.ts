#!/usr/bin/env node
import { Command } from 'commander';
import { calculateTotalScore } from './calculator.js';

const program = new Command();

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

    const results = calculateTotalScore(unhoused, family, subscription);

    console.log('\n--- Cheong-yak Score Results ---');
    console.log(`Unhoused Period Score:   ${results.unhousedScore} / 32`);
    console.log(`Family Members Score:    ${results.dependentsScore} / 35`);
    console.log(`Subscription Score:      ${results.subscriptionScore} / 17`);
    console.log('--------------------------------');
    console.log(`Total Score:             ${results.totalScore} / 84\n`);
  });

program.parse(process.argv);
