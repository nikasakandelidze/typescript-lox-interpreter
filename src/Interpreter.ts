import {
  Binary,
  Expression,
  ExpressionVisitor,
  Grouping,
  Literal,
  Unary,
} from "./Expression";
import { Lox } from "./Lox";
import { RuntimeError } from "./RuntimeError";
import { Expr, Print, Statement, StatementVisitor } from "./Statement";
import { LiteralValue, Token, TokenType } from "./Token";

export class Interpreter
  implements ExpressionVisitor<LiteralValue>, StatementVisitor<void>
{
  interpret(statements: Statement[]) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      const err = error as RuntimeError;
      Lox.runtimeError(err);
    }
  }

  visitExpressionStatement(stmt: Expr): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStatement(stmt: Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitLiteralExpr(expr: Literal): unknown {
    return expr.value;
  }

  visitGroupingExpr(expr: Grouping): unknown {
    return this.evaluate(expr.expression);
  }

  visitBinaryExpr(expr: Binary): unknown {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case TokenType.PLUS: {
        if (typeof left === "number" && typeof right === "number") {
          return Number(left) + Number(right);
        }

        if (typeof left === "string" && typeof right === "string") {
          return String(left) + String(right);
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings"
        );
      }

      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);

      case TokenType.BANG_EQUAL:
        return left !== right;
      case TokenType.EQUAL_EQUAL:
        return left === right;
    }

    return null;
  }

  visitUnaryExpr(expr: Unary): unknown {
    const right = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.BANG:
        return !Boolean(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -Number(right);
    }
    return null;
  }

  private execute(stmt: Statement) {
    stmt.accept(this);
  }

  private stringify(literal: LiteralValue) {
    if (literal === null) return "nil";

    if (typeof literal === "number") {
      return Number(literal).toString();
    }
    return `${literal}`;
  }

  private checkNumberOperand(operator: Token, operand: LiteralValue) {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be numbers.");
  }

  private checkNumberOperands(
    operator: Token,
    left: LiteralValue,
    right: LiteralValue
  ) {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private evaluate(expr: Expression) {
    return expr.accept(this);
  }
}