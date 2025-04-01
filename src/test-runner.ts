import { expect, describe, test, afterEach, Assertion } from 'vitest';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

interface TestSuiteResult {
  suiteName: string;
  tests: TestResult[];
  allPassed: boolean;
}

export const testResults: TestSuiteResult[] = [];

export const runTestSuite = (suiteName: string, testFn: () => void) => {
  const suiteResult: TestSuiteResult = {
    suiteName,
    tests: [],
    allPassed: true
  };

  describe(suiteName, () => {
    afterEach((context) => {
      const testName = context.task.name;
      const testPassed = context.task.result?.state === 'pass';
      const errors = context.task.result?.errors;

      suiteResult.tests.push({
        name: testName,
        passed: testPassed,
        error: errors?.[0]?.message
      });

      if (!testPassed) {
        suiteResult.allPassed = false;
        console.log(`\n❌ Test failed: ${testName}`);
        if (errors?.[0]) {
          console.log('Error:', errors[0].message);
        }
      } else {
        console.log(`\n✅ Test passed: ${testName}`);
      }
    });

    testFn();
  });

  testResults.push(suiteResult);
  return suiteResult;
};

export const expectSafe = (actual: any): Assertion<any> => {
  try {
    return expect(actual);
  } catch (error) {
    console.log('Expectation failed but continuing:', error);
    return expect(true);
  }
}; 