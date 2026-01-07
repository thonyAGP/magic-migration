/**
 * Magic Unipaas Expression Parser - AST Visitor Interface
 *
 * Defines the visitor pattern interface for traversing and transforming AST nodes.
 */

import {
  ASTNode,
  ASTNodeKind,
  Expression,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  FieldReference,
  SpecialReference,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  Identifier,
} from '../types/ast';

/**
 * Visitor interface for AST traversal
 *
 * Each visit method receives a node and returns a result of type T.
 */
export interface ASTVisitor<T> {
  visitNumberLiteral(node: NumberLiteral): T;
  visitStringLiteral(node: StringLiteral): T;
  visitBooleanLiteral(node: BooleanLiteral): T;
  visitFieldReference(node: FieldReference): T;
  visitSpecialReference(node: SpecialReference): T;
  visitBinaryExpression(node: BinaryExpression): T;
  visitUnaryExpression(node: UnaryExpression): T;
  visitFunctionCall(node: FunctionCall): T;
  visitIdentifier(node: Identifier): T;
}

/**
 * Visit an AST node with the given visitor
 */
export function visit<T>(node: Expression, visitor: ASTVisitor<T>): T {
  switch (node.kind) {
    case ASTNodeKind.NumberLiteral:
      return visitor.visitNumberLiteral(node);
    case ASTNodeKind.StringLiteral:
      return visitor.visitStringLiteral(node);
    case ASTNodeKind.BooleanLiteral:
      return visitor.visitBooleanLiteral(node);
    case ASTNodeKind.FieldReference:
      return visitor.visitFieldReference(node);
    case ASTNodeKind.SpecialReference:
      return visitor.visitSpecialReference(node);
    case ASTNodeKind.BinaryExpression:
      return visitor.visitBinaryExpression(node);
    case ASTNodeKind.UnaryExpression:
      return visitor.visitUnaryExpression(node);
    case ASTNodeKind.FunctionCall:
      return visitor.visitFunctionCall(node);
    case ASTNodeKind.Identifier:
      return visitor.visitIdentifier(node);
    default:
      throw new Error(`Unknown AST node kind: ${(node as ASTNode).kind}`);
  }
}

/**
 * Base visitor with default implementations that can be overridden
 */
export abstract class BaseVisitor<T> implements ASTVisitor<T> {
  /**
   * Default implementation for visiting children
   */
  protected abstract defaultValue(): T;

  visitNumberLiteral(node: NumberLiteral): T {
    return this.defaultValue();
  }

  visitStringLiteral(node: StringLiteral): T {
    return this.defaultValue();
  }

  visitBooleanLiteral(node: BooleanLiteral): T {
    return this.defaultValue();
  }

  visitFieldReference(node: FieldReference): T {
    return this.defaultValue();
  }

  visitSpecialReference(node: SpecialReference): T {
    return this.defaultValue();
  }

  visitBinaryExpression(node: BinaryExpression): T {
    visit(node.left, this);
    visit(node.right, this);
    return this.defaultValue();
  }

  visitUnaryExpression(node: UnaryExpression): T {
    visit(node.operand, this);
    return this.defaultValue();
  }

  visitFunctionCall(node: FunctionCall): T {
    for (const arg of node.arguments) {
      visit(arg, this);
    }
    return this.defaultValue();
  }

  visitIdentifier(node: Identifier): T {
    return this.defaultValue();
  }
}

/**
 * Pretty printer visitor for debugging
 */
export class PrettyPrinter implements ASTVisitor<string> {
  private indent: number = 0;

  private getIndent(): string {
    return '  '.repeat(this.indent);
  }

  visitNumberLiteral(node: NumberLiteral): string {
    return `${this.getIndent()}NumberLiteral(${node.value})`;
  }

  visitStringLiteral(node: StringLiteral): string {
    return `${this.getIndent()}StringLiteral("${node.value}")`;
  }

  visitBooleanLiteral(node: BooleanLiteral): string {
    return `${this.getIndent()}BooleanLiteral(${node.value})`;
  }

  visitFieldReference(node: FieldReference): string {
    return `${this.getIndent()}FieldRef{${node.context},${node.field}}`;
  }

  visitSpecialReference(node: SpecialReference): string {
    return `${this.getIndent()}SpecialRef{${node.id},${node.comp}}'${node.refType}`;
  }

  visitBinaryExpression(node: BinaryExpression): string {
    this.indent++;
    const left = visit(node.left, this);
    const right = visit(node.right, this);
    this.indent--;
    return `${this.getIndent()}BinaryExpr(${node.operator})\n${left}\n${right}`;
  }

  visitUnaryExpression(node: UnaryExpression): string {
    this.indent++;
    const operand = visit(node.operand, this);
    this.indent--;
    return `${this.getIndent()}UnaryExpr(${node.operator})\n${operand}`;
  }

  visitFunctionCall(node: FunctionCall): string {
    this.indent++;
    const args = node.arguments.map((arg) => visit(arg, this)).join('\n');
    this.indent--;
    return `${this.getIndent()}FunctionCall(${node.name})\n${args}`;
  }

  visitIdentifier(node: Identifier): string {
    return `${this.getIndent()}Identifier(${node.name})`;
  }
}

/**
 * Print AST as a tree for debugging
 */
export function printAST(node: Expression): string {
  return visit(node, new PrettyPrinter());
}
