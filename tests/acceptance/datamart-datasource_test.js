import {executeQuery} from '../../lib/infrastructure/datamart-datasource.js';

describe("Acceptance | datamart-datasource", function() {
  describe("executeQuery", function() {
    it("should return result of the given query", async function() {
      executeQuery('SELECT COUNT(*) FROM public.data_ref_academies');
    });
  });
});
