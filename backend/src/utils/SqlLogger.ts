/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/SqlLogger.ts

import { Logger, QueryRunner } from "typeorm";
import { format } from "sql-formatter";

export class SqlLogger implements Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const formattedQuery = format(query, { language: "mysql" });

    console.log("---------------------------------------------------");
    console.log("Query:");
    console.log(formattedQuery);
    if (parameters && parameters.length) {
      console.log("Parameters:", parameters);
    }
    console.log("---------------------------------------------------");
  }

  // Prettier가 원하는 대로 파라미터를 여러 줄로 나눔
  logQueryError(
    error: string,
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    // 에러 발생 시에도 포맷팅된 쿼리를 보여주면 디버깅에 더 유용합니다.
    const formattedQuery = format(query, { language: "mysql" });

    console.error("-------------------QUERY FAILED--------------------");
    console.error("Error:", error);
    console.error("Query:", formattedQuery);
    if (parameters && parameters.length) {
      console.error("Parameters:", parameters);
    }
    console.error("---------------------------------------------------");
  }

  // Prettier가 원하는 대로 파라미터를 여러 줄로 나눔
  logQuerySlow(
    time: number,
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const formattedQuery = format(query, { language: "mysql" });
    console.warn("-------------------SLOW QUERY----------------------");
    console.warn(`Execution time: ${time}ms`);
    console.warn("Query:", formattedQuery);
    if (parameters && parameters.length) {
      console.warn("Parameters:", parameters);
    }
    console.warn("---------------------------------------------------");
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    console.log(message);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    console.log(message);
  }

  log(
    level: "log" | "info" | "warn",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    queryRunner?: QueryRunner,
  ) {
    switch (level) {
      case "log":
      case "info":
        console.info(message);
        break;
      case "warn":
        console.warn(message);
        break;
    }
  }
}
