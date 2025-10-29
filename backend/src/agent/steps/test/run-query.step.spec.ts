import { RunQueryStep } from '../run-query.step';
import { createMockAgentState } from '../../../../test/utils/test-helpers';

describe('RunQueryStep', () => {
  let step: RunQueryStep;

  beforeEach(() => {
    console.log("📝 [BeforeEach] Setting up RunQueryStep unit test");
    step = new RunQueryStep();
  });

  describe('execute', () => {
    it('should execute SQL query and store results', async () => {
      console.log("📝 [UNIT TEST START] Test: should execute SQL query and store results");
      
      const agentState = createMockAgentState({
        sqlQuery: 'SELECT COUNT(*) as count FROM customers;',
      });

      console.log(`📝 [UNIT TEST] Agent state created with SQL: ${agentState.sqlQuery}`);

      (agentState.sqlDb.run as jest.Mock).mockResolvedValue([{ count: 10 }]);
      console.log("📝 [UNIT TEST] Mocked sqlDb.run to return [{ count: 10 }]");

      await step.execute(agentState);

      console.log(`📝 [UNIT TEST] Step executed, queryResult: ${agentState.queryResult}`);
      console.log(`📝 [UNIT TEST] sqlDb.run was called: ${(agentState.sqlDb.run as jest.Mock).mock.calls.length} times`);

      expect(agentState.queryResult).toBeTruthy();
      expect(agentState.sqlDb.run).toHaveBeenCalledWith(agentState.sqlQuery);
      expect(agentState.queryResult).toContain('"count"');
      expect(agentState.queryResult).toContain('10');
      console.log("📝 [UNIT TEST PASS] Test passed!");
    });

    it('should throw error when SQL execution fails', async () => {
      console.log("📝 [UNIT TEST START] Test: should throw error when SQL execution fails");
      
      const agentState = createMockAgentState({
        sqlQuery: 'INVALID SQL SYNTAX!!!',
      });

      const errorMessage = 'Syntax error near INVALID';
      (agentState.sqlDb.run as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );
      console.log(`📝 [UNIT TEST] Mocked sqlDb.run to reject with error: ${errorMessage}`);

      await expect(step.execute(agentState)).rejects.toThrow(
        `Failed to execute SQL query: ${errorMessage}`,
      );
      
      console.log("📝 [UNIT TEST PASS] Error handling test passed!");
    });

    it('should handle empty results', async () => {
      console.log("📝 [UNIT TEST START] Test: should handle empty results");
      
      const agentState = createMockAgentState({
        sqlQuery: 'SELECT * FROM customers WHERE id = 999;',
      });

      (agentState.sqlDb.run as jest.Mock).mockResolvedValue([]);
      console.log("📝 [UNIT TEST] Mocked sqlDb.run to return empty array []");

      await step.execute(agentState);

      console.log(`📝 [UNIT TEST] Step executed, queryResult: ${agentState.queryResult}`);

      expect(agentState.queryResult).toBe('[]');
      console.log("📝 [UNIT TEST PASS] Empty results test passed!");
    });
  });
});
