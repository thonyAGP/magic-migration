/**
 * Magic Unipaas Expression Parser - TypeScript Code Generator
 *
 * Generates TypeScript code from Magic expression AST.
 */

import {
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
  BinaryOperator,
  UnaryOperator,
} from '../types/ast';
import { SpecialRefType } from '../types/tokens';
import { ASTVisitor, visit } from './visitor';

/**
 * Options for TypeScript code generation
 */
export interface TypeScriptGeneratorOptions {
  /** Prefix for field references (default: 'fields') */
  fieldPrefix?: string;
  /** Prefix for main program variables (default: 'mainProgram') */
  mainProgramPrefix?: string;
  /** Whether to use optional chaining for field access (default: true) */
  useOptionalChaining?: boolean;
  /** Whether to generate type annotations (default: false) */
  includeTypes?: boolean;
}

/**
 * Magic function to TypeScript mapping
 * Complete reference: 200 functions with TypeScript equivalents
 */
const FUNCTION_MAPPINGS: Record<string, string | ((args: string[]) => string)> = {
  // ============================================================================
  // STRING FUNCTIONS (20+)
  // ============================================================================
  Trim: (args) => `${args[0]}.trim()`,
  LTrim: (args) => `${args[0]}.trimStart()`,
  RTrim: (args) => `${args[0]}.trimEnd()`,
  Upper: (args) => `${args[0]}.toUpperCase()`,
  Lower: (args) => `${args[0]}.toLowerCase()`,
  Len: (args) => `${args[0]}.length`,
  Left: (args) => `${args[0]}.substring(0, ${args[1]})`,
  Right: (args) => `${args[0]}.slice(-${args[1]})`,
  Mid: (args) => `${args[0]}.substring(${args[1]} - 1, ${args[1]} - 1 + ${args[2]})`,
  SubStr: (args) => `${args[0]}.substring(${args[1]} - 1, ${args[1]} - 1 + ${args[2]})`,
  InStr: (args) => `(${args[0]}.indexOf(${args[1]}) + 1)`,
  Rep: (args) => `${args[0]}.repeat(${args[1]})`,
  RepStr: (args) => `${args[0]}.replace(${args[1]}, ${args[2]})`,
  Fill: (args) => `${args[0]}.repeat(${args[1]})`,
  Chr: (args) => `String.fromCharCode(${args[0]})`,
  ASCIIChr: (args) => `String.fromCharCode(${args[0]})`,
  Asc: (args) => `${args[0]}.charCodeAt(0)`,
  ASCIIVal: (args) => `${args[0]}.charCodeAt(0)`,
  StrToken: (args) => `${args[0]}.split(${args[2]})[${args[1]} - 1] ?? ''`,
  StrTokenCnt: (args) => `${args[0]}.split(${args[1]}).length`,
  StrBuild: (args) => `sprintf(${args.join(', ')})`,
  // Batch 1 additions
  DelStr: (args) => `${args[0]}.substring(0, ${args[1]} - 1) + ${args[0]}.substring(${args[1]} - 1 + ${args[2]})`,
  Ins: (args) => `${args[0]}.slice(0, ${args[2]} - 1) + ${args[1]} + ${args[0]}.slice(${args[2]} - 1)`,
  Flip: (args) => `${args[0]}.split('').reverse().join('')`,
  Soundx: (args) => `soundex(${args[0]})`,
  Like: (args) => `new RegExp('^' + ${args[1]}.replace(/\\*/g, '.*').replace(/\\?/g, '.') + '$').test(${args[0]})`,

  // ============================================================================
  // NUMERIC FUNCTIONS (15+)
  // ============================================================================
  Abs: (args) => `Math.abs(${args[0]})`,
  Round: (args) => `Number(${args[0]}.toFixed(${args[1]}))`,
  Trunc: (args) => `Math.trunc(${args[0]} * Math.pow(10, ${args[1]})) / Math.pow(10, ${args[1]})`,
  Int: (args) => `Math.floor(${args[0]})`,
  Mod: (args) => `(${args[0]} % ${args[1]})`,
  Min: (args) => `Math.min(${args.join(', ')})`,
  Max: (args) => `Math.max(${args.join(', ')})`,
  Pow: (args) => `Math.pow(${args[0]}, ${args[1]})`,
  Pwr: (args) => `Math.pow(${args[0]}, ${args[1]})`,
  Sqrt: (args) => `Math.sqrt(${args[0]})`,
  Exp: (args) => `Math.exp(${args[0]})`,
  Log: (args) => `Math.log(${args[0]})`,
  Log10: (args) => `Math.log10(${args[0]})`,
  Sin: (args) => `Math.sin(${args[0]})`,
  Cos: (args) => `Math.cos(${args[0]})`,
  Tan: (args) => `Math.tan(${args[0]})`,
  ASin: (args) => `Math.asin(${args[0]})`,
  ACos: (args) => `Math.acos(${args[0]})`,
  ATan: (args) => `Math.atan(${args[0]})`,
  Rand: (args) => `Math.floor(Math.random() * ${args[0]})`,

  // ============================================================================
  // DATE FUNCTIONS (22+)
  // ============================================================================
  Date: () => 'new Date()',
  Day: (args) => `${args[0]}.getDate()`,
  Month: (args) => `(${args[0]}.getMonth() + 1)`,
  Year: (args) => `${args[0]}.getFullYear()`,
  DOW: (args) => `(${args[0]}.getDay() + 1)`,
  CDOW: (args) => `format(${args[0]}, 'EEEE')`,
  NDOW: (args) => `['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][${args[0]} - 1]`,
  CMonth: (args) => `format(${args[0]}, 'MMMM')`,
  NMonth: (args) => `format(new Date(2000, ${args[0]} - 1, 1), 'MMMM')`,
  DStr: (args) => `formatDate(${args[0]}, ${args[1]})`,
  DVal: (args) => `parseDate(${args[0]}, ${args[1]})`,
  BOM: (args) => `startOfMonth(${args[0]})`,
  EOM: (args) => `endOfMonth(${args[0]})`,
  BOY: (args) => `startOfYear(${args[0]})`,
  EOY: (args) => `endOfYear(${args[0]})`,
  AddDate: (args) => `addYears(addMonths(addDays(${args[0]}, ${args[3]}), ${args[2]}), ${args[1]})`,
  MDate: () => 'sessionDate',
  Week: (args) => `getWeek(${args[0]})`,

  // ============================================================================
  // TIME FUNCTIONS (10+)
  // ============================================================================
  Time: () => 'new Date()',
  Hour: (args) => `${args[0]}.getHours()`,
  Minute: (args) => `${args[0]}.getMinutes()`,
  Second: (args) => `${args[0]}.getSeconds()`,
  TStr: (args) => `formatTime(${args[0]}, ${args[1]})`,
  TVal: (args) => `parseTime(${args[0]}, ${args[1]})`,
  AddTime: (args) => `addHours(addMinutes(addSeconds(${args[0]}, ${args[3]}), ${args[2]}), ${args[1]})`,
  AddDateTime: (args) => `addDateTime(${args.join(', ')})`,
  DifDateTime: (args) => `difDateTime(${args.join(', ')})`,
  MTime: () => 'sessionTime',
  Timer: (args) => `(${args[0]} ? (timerStart = performance.now(), 0) : (performance.now() - timerStart) / 1000)`,

  // ============================================================================
  // FLOW CONTROL & CONDITIONALS (10+)
  // ============================================================================
  IF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  IIF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  CASE: (args) => generateCaseExpression(args),
  Choose: (args) => `[${args.slice(1).join(', ')}][${args[0]} - 1]`,
  IN: (args) => `${args[1]}.split(',').includes(${args[0]})`,
  CndRange: (args) => `(${args[0]} ? query.where(${args[2]}).gte(${args[3]}).lte(${args[4]}) : query)`,
  IsNull: (args) => `(${args[0]} == null)`,
  NullVal: (args) => 'null',
  IsDefault: (args) => `(${args[0]} === undefined)`,
  Range: (args) => `(${args[0]} >= ${args[1]} && ${args[0]} <= ${args[2]})`,

  // ============================================================================
  // CONVERSION (10+)
  // ============================================================================
  Val: (args) => `Number(${args[0]})`,
  Str: (args) => `formatNumber(${args[0]}, ${args[1]})`,
  Fix: (args) => `Math.trunc(${args[0]})`,
  Hex: (args) => `${args[0]}.toString(16).toUpperCase()`,
  HVal: (args) => `parseInt(${args[0]}, 16)`,
  NullIf: (args) => `(${args[0]} === ${args[1]} ? null : ${args[0]})`,

  // ============================================================================
  // VARIABLE/PARAMETER (5+)
  // ============================================================================
  GetParam: (args) => `getParam(${args[0]})`,
  SetParam: (args) => `setParam(${args[0]}, ${args[1]})`,
  Translate: (args) => `translate(${args[0]})`,
  INIGet: (args) => `iniGet(${args[0]}, ${args[1]}, ${args[2]})`,
  ExpCalc: (args) => `expCalc(${args[0]})`,

  // ============================================================================
  // DATABASE FUNCTIONS (15+)
  // ============================================================================
  DbName: (args) => `getTableName(${args[0]})`,
  DbRecs: (args) => `await prisma.${args[0]}.count()`,
  DbDel: (args) => `await prisma.${args[0]}.deleteMany()`,
  Counter: (args) => `counter(${args[0]})`,
  EOF: (args) => `isEOF(${args[0]})`,
  DbViewRefresh: (args) => `await refreshView(${args[0]})`,
  DbPos: (args) => `currentIndex + 1`,
  DbSize: (args) => `records.length`,
  DbNext: (args) => `(++currentIndex < records.length)`,
  DbPrev: (args) => `(--currentIndex >= 0)`,
  Rollback: () => 'await transaction.rollback()',
  Stat: (args) => `getStat(${args[0]}, ${args[1]})`,
  IsFirstRecordCycle: (args) => `(currentIndex === 0)`,

  // ============================================================================
  // SYSTEM FUNCTIONS (15+)
  // ============================================================================
  User: () => 'getCurrentUser()',
  Delay: (args) => `await new Promise(r => setTimeout(r, ${args[0]} * 1000))`,
  Wait: (args) => `await new Promise(r => setTimeout(r, ${args[0]} * 1000))`,
  Sleep: (args) => `await new Promise(r => setTimeout(r, ${args[0]}))`,
  OSEnv: (args) => `process.env[${args[0]}] ?? ''`,
  OSEnvGet: (args) => `process.env[${args[0]}] ?? ''`,
  RunMode: () => 'getRunMode()',
  IsComponent: () => 'isComponent()',
  GetHostName: () => 'os.hostname()',
  GetGUID: () => 'crypto.randomUUID()',
  Prog: () => 'getCurrentProgram()',
  Level: (args) => `getLevel(${args[0]})`,
  CallProg: (args) => `await callProgram(${args.join(', ')})`,

  // ============================================================================
  // UI FUNCTIONS (15+)
  // ============================================================================
  SetCrsr: (args) => `document.body.style.cursor = ${args[0]} === 1 ? 'wait' : 'default'`,
  MsgBox: (args) => `await showMessageBox(${args.join(', ')})`,
  VerifyBox: (args) => `confirm(${args[0]})`,
  InputBox: (args) => `prompt(${args[1]}, ${args[2]})`,
  FormStateClear: (args) => `localStorage.removeItem('form_' + ${args[0]})`,
  CtrlGoto: (args) => `document.getElementById(${args[0]})?.focus()`,
  CtrlRefresh: (args) => `refreshControl(${args[0]})`,
  ViewRefresh: (args) => `await refreshView(${args[0]})`,
  SetLang: (args) => `i18n.changeLanguage(${args[0]})`,
  GetLang: () => 'i18n.language',
  LastPark: () => 'document.activeElement?.id',

  // ============================================================================
  // FILE FUNCTIONS (15+)
  // ============================================================================
  FileExist: (args) => `fs.existsSync(${args[0]})`,
  FileDelete: (args) => `fs.unlinkSync(${args[0]})`,
  FileCopy: (args) => `fs.copyFileSync(${args[0]}, ${args[1]})`,
  FileRename: (args) => `fs.renameSync(${args[0]}, ${args[1]})`,
  FileSize: (args) => `fs.statSync(${args[0]}).size`,
  FileInfo: (args) => `getFileInfo(${args[0]}, ${args[1]})`,
  FileListGet: (args) => `fs.readdirSync(${args[0]}).filter(f => f.match(${args[1]}))`,
  File2Blb: (args) => `fs.readFileSync(${args[0]})`,
  Blb2File: (args) => `fs.writeFileSync(${args[1]}, ${args[0]})`,

  // ============================================================================
  // FLOW/ERROR FUNCTIONS (10+)
  // ============================================================================
  Exit: () => 'return',
  ErrMagic: () => 'lastErrorCode ?? 0',
  ErrDbms: () => 'lastDbErrorCode ?? 0',
  FlwLstRec: () => '(currentIndex === records.length - 1)',
  FlwFstRec: () => '(currentIndex === 0)',

  // ============================================================================
  // XML FUNCTIONS (10)
  // ============================================================================
  XMLStr: (args) => `${args[0]}.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')`,
  XMLVal: (args) => `${args[0]}.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')`,
  XMLGet: (args) => `xmlGet(${args[0]}, ${args[1]})`,
  XMLCnt: (args) => `xmlCount(${args[0]}, ${args[1]})`,
  XMLExist: (args) => `xmlExists(${args[0]}, ${args[1]})`,
  XMLInsert: (args) => `xmlInsert(${args[0]}, ${args[1]}, ${args[2]}, ${args[3]}, ${args[4]})`,
  XMLModify: (args) => `xmlModify(${args[0]}, ${args[1]}, ${args[2]})`,
  XMLDelete: (args) => `xmlDelete(${args[0]}, ${args[1]})`,
  XMLValidate: (args) => `xmlValidate(${args[0]}, ${args[1]})`,
  XMLSetNS: (args) => `xmlSetNamespace(${args[0]}, ${args[1]}, ${args[2]})`,

  // ============================================================================
  // VECTOR FUNCTIONS (4)
  // ============================================================================
  VecGet: (args) => `${args[0]}[${args[1]} - 1]`,
  VecSet: (args) => `${args[0]}[${args[1]} - 1] = ${args[2]}`,
  VecSize: (args) => `${args[0]}.length`,
  VecCellAttr: (args) => `(${args[0]}[${args[1]} - 1] === undefined)`,

  // ============================================================================
  // BUFFER FUNCTIONS (14)
  // ============================================================================
  BufGetAlpha: (args) => `${args[0]}.toString('utf8', ${args[1]} - 1, ${args[1]} - 1 + ${args[2]})`,
  BufSetAlpha: (args) => `${args[0]}.write(${args[2]}, ${args[1]} - 1, 'utf8')`,
  BufGetNum: (args) => `parseFloat(${args[0]}.toString('utf8', ${args[1]} - 1, ${args[1]} - 1 + ${args[2]}))`,
  BufSetNum: (args) => `${args[0]}.writeFloatLE(${args[2]}, ${args[1]} - 1)`,
  BufGetDate: (args) => `parseDate(${args[0]}.toString('utf8', ${args[1]} - 1, 8), ${args[2]})`,
  BufSetDate: (args) => `${args[0]}.write(formatDate(${args[2]}, ${args[3]}), ${args[1]} - 1)`,
  BufGetTime: (args) => `parseTime(${args[0]}.toString('utf8', ${args[1]} - 1, 6), ${args[2]})`,
  BufSetTime: (args) => `${args[0]}.write(formatTime(${args[2]}, ${args[3]}), ${args[1]} - 1)`,
  BufGetLog: (args) => `(${args[0]}[${args[1]} - 1] !== 0)`,
  BufSetLog: (args) => `${args[0]}[${args[1]} - 1] = ${args[2]} ? 1 : 0`,
  BufGetBlob: (args) => `${args[0]}.slice(${args[1]} - 1, ${args[1]} - 1 + ${args[2]})`,
  BufSetBlob: (args) => `${args[2]}.copy(${args[0]}, ${args[1]} - 1)`,
  BufGetUnicode: (args) => `${args[0]}.toString('utf16le', ${args[1]} - 1, ${args[1]} - 1 + ${args[2]} * 2)`,
  BufSetUnicode: (args) => `${args[0]}.write(${args[2]}, ${args[1]} - 1, 'utf16le')`,

  // ============================================================================
  // DATAVIEW EXPORT (2)
  // ============================================================================
  DataViewToXML: (args) => `dataViewToXML(${args[0]}, ${args[1]})`,
  DataViewToHTML: (args) => `dataViewToHTML(${args[0]}, ${args[1]})`,

  // ============================================================================
  // DLL FUNCTIONS (3)
  // ============================================================================
  CallDLL: (args) => `callDLL(${args.join(', ')})`,
  CallDLLF: (args) => `callDLLFloat(${args.join(', ')})`,
  CallDLLS: (args) => `callDLLString(${args.join(', ')})`,

  // ============================================================================
  // HTTP FUNCTIONS (2)
  // ============================================================================
  CallURL: (args) => `await fetch(${args[0]}, { method: ${args[1]}, headers: ${args[2]}, body: ${args[3]} })`,
  CallProgURL: (args) => `await fetch(\`\${${args[0]}}/api/\${${args[1]}}\`, { method: 'POST', body: JSON.stringify([${args.slice(2).join(', ')}]) })`,

  // ============================================================================
  // COM FUNCTIONS (5)
  // ============================================================================
  COMObjCreate: (args) => `createCOMObject(${args[0]})`,
  COMObjRelease: (args) => `releaseCOMObject(${args[0]})`,
  COMHandleGet: (args) => `getCOMHandle(${args[0]})`,
  COMHandleSet: (args) => `setCOMHandle(${args[0]}, ${args[1]})`,
  COMError: () => 'lastCOMError',

  // ============================================================================
  // MAIL FUNCTION (1)
  // ============================================================================
  MailSend: (args) => `await transporter.sendMail({ to: ${args[0]}, subject: ${args[1]}, text: ${args[2]}, attachments: ${args[3]} })`,

  // ============================================================================
  // SECURITY FUNCTIONS (3)
  // ============================================================================
  Cipher: (args) => `cipher(${args[0]}, ${args[1]}, ${args[2]})`,
  ClientCertificateAdd: (args) => `addClientCertificate(${args[0]}, ${args[1]})`,
  ClientCertificateDiscard: (args) => `discardClientCertificate(${args[0]})`,

  // ============================================================================
  // CLIPBOARD FUNCTIONS (3)
  // ============================================================================
  ClipAdd: (args) => `await navigator.clipboard.writeText(${args[0]})`,
  ClipRead: (args) => `await navigator.clipboard.readText()`,
  ClipWrite: (args) => `await navigator.clipboard.writeText(${args[0]})`,

  // ============================================================================
  // CONTEXT FUNCTIONS (11)
  // ============================================================================
  CtxGetId: (args) => `context.id`,
  CtxGetName: (args) => `context.name`,
  CtxSetName: (args) => `context.name = ${args[1]}`,
  CtxNum: () => 'activeContexts.size',
  CtxClose: (args) => `context.dispose()`,
  CtxKill: (args) => `context.abort()`,
  CtxStat: (args) => `context.status`,
  CtxProg: (args) => `context.currentProgram`,
  CtxSize: (args) => `process.memoryUsage().heapUsed`,
  CtxLstUse: (args) => `context.lastActivity`,
  CtxGetAllNames: () => `[...contexts.values()].map(c => c.name).join(',')`,

  // ============================================================================
  // WINDOW FUNCTIONS (5)
  // ============================================================================
  WinBox: (args) => `getWindowProperty(${args[0]}, ${args[1]})`,
  WinHWND: (args) => `getWindowHandle(${args[0]})`,
  WinMaximize: (args) => `maximizeWindow(${args[0]})`,
  WinMinimize: (args) => `minimizeWindow(${args[0]})`,
  WinRestore: (args) => `restoreWindow(${args[0]})`,

  // ============================================================================
  // MENU FUNCTIONS (6)
  // ============================================================================
  MnuAdd: (args) => `menu.append(new MenuItem({ label: ${args[1]} }))`,
  MnuCheck: (args) => `menuItem.checked = ${args[1]}`,
  MnuEnabl: (args) => `menuItem.enabled = ${args[1]}`,
  MnuName: (args) => `menuItem.label`,
  MnuRemove: (args) => `menu.remove(menuItem)`,
  MnuShow: (args) => `menuItem.visible = ${args[1]}`,

  // ============================================================================
  // CONTROL FUNCTIONS (7)
  // ============================================================================
  CHeight: (args) => `document.getElementById(${args[0]})?.offsetHeight ?? 0`,
  CWidth: (args) => `document.getElementById(${args[0]})?.offsetWidth ?? 0`,
  CX: (args) => `document.getElementById(${args[0]})?.offsetLeft ?? 0`,
  CY: (args) => `document.getElementById(${args[0]})?.offsetTop ?? 0`,
  CurRow: (args) => `currentRowIndex`,
  ClickWX: () => 'lastClickEvent.clientX',
  ClickWY: () => 'lastClickEvent.clientY',

  // ============================================================================
  // MULTIMARK FUNCTIONS (4)
  // ============================================================================
  MMCount: (args) => `selectedRows.length`,
  MMCurr: (args) => `currentSelectedIndex`,
  MMClear: (args) => `selectedRows = []`,
  MMStop: () => 'break',

  // ============================================================================
  // LOCKING FUNCTIONS (2)
  // ============================================================================
  Lock: (args) => `await mutex.acquire()`,
  UnLock: (args) => `mutex.release()`,

  // ============================================================================
  // RANGE/LOCATE/SORT FUNCTIONS (6)
  // ============================================================================
  RangeAdd: (args) => `query = query.where(${args[1]}).gte(${args[2]}).lte(${args[3]})`,
  RangeReset: (args) => `query = baseQuery`,
  LocateAdd: (args) => `query = query.where({ ${args[1]}: ${args[2]} })`,
  LocateReset: (args) => `locateCriteria = {}`,
  SortAdd: (args) => `query = query.orderBy(${args[1]}, ${args[2]} === 0 ? 'asc' : 'desc')`,
  SortReset: (args) => `query = query.unordered()`,

  // ============================================================================
  // I18N/TRANSLATION (3)
  // ============================================================================
  MlsTrans: (args) => `i18n.t(${args[0]})`,
  Empty: () => "''",
  NOT: (args) => `!(${args[0]})`,
};

/**
 * Generate CASE expression in TypeScript
 */
function generateCaseExpression(args: string[]): string {
  if (args.length < 4) {
    return `/* Invalid CASE */ null`;
  }

  const expr = args[0];
  const pairs: string[] = [];

  for (let i = 1; i < args.length - 1; i += 2) {
    if (i + 1 < args.length) {
      pairs.push(`${expr} === ${args[i]} ? ${args[i + 1]}`);
    }
  }

  // Default value (last arg if odd count, else undefined)
  const defaultValue = args.length % 2 === 0 ? args[args.length - 1] : 'undefined';

  return `(${pairs.join(' : ')} : ${defaultValue})`;
}

/**
 * TypeScript code generator visitor
 */
export class TypeScriptGenerator implements ASTVisitor<string> {
  private readonly options: Required<TypeScriptGeneratorOptions>;

  constructor(options: TypeScriptGeneratorOptions = {}) {
    this.options = {
      fieldPrefix: options.fieldPrefix ?? 'fields',
      mainProgramPrefix: options.mainProgramPrefix ?? 'mainProgram',
      useOptionalChaining: options.useOptionalChaining ?? true,
      includeTypes: options.includeTypes ?? false,
    };
  }

  visitNumberLiteral(node: NumberLiteral): string {
    return node.raw;
  }

  visitStringLiteral(node: StringLiteral): string {
    // Convert Magic strings to JS template literals or regular strings
    const escaped = node.value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n');
    return `'${escaped}'`;
  }

  visitBooleanLiteral(node: BooleanLiteral): string {
    return node.value ? 'true' : 'false';
  }

  visitFieldReference(node: FieldReference): string {
    const { context, field } = node;
    const accessor = this.options.useOptionalChaining ? '?.' : '.';

    // Context 0: Current task variables
    if (context === 0) {
      return `${this.options.fieldPrefix}${accessor}v${field}`;
    }

    // Context 32768: Main program variables
    if (context === 32768) {
      return `${this.options.mainProgramPrefix}${accessor}v${field}`;
    }

    // Context 1-N: Parent task parameters
    if (context >= 1 && context < 32768) {
      return `parent${context}${accessor}p${field}`;
    }

    // Generic fallback
    return `getField(${context}, ${field})`;
  }

  visitSpecialReference(node: SpecialReference): string {
    const { refType, id, comp } = node;

    switch (refType) {
      case SpecialRefType.PROG:
        return `programs[${id}]`;

      case SpecialRefType.DSOURCE:
        return `tables[${comp}][${id}]`;

      case SpecialRefType.VAR:
        if (comp === 0) {
          return `${this.options.fieldPrefix}.v${id}`;
        }
        return `getVariable(${comp}, ${id})`;

      case SpecialRefType.FORM:
        return `forms[${id}]`;

      default:
        return `/* Unknown ref type: ${refType} */ null`;
    }
  }

  visitBinaryExpression(node: BinaryExpression): string {
    const left = visit(node.left, this);
    const right = visit(node.right, this);

    const operatorMap: Record<BinaryOperator, string> = {
      [BinaryOperator.Add]: '+',
      [BinaryOperator.Subtract]: '-',
      [BinaryOperator.Multiply]: '*',
      [BinaryOperator.Divide]: '/',
      [BinaryOperator.Power]: '**',
      [BinaryOperator.Mod]: '%',
      [BinaryOperator.Concat]: '+',
      [BinaryOperator.Equal]: '===',
      [BinaryOperator.NotEqual]: '!==',
      [BinaryOperator.LessThan]: '<',
      [BinaryOperator.GreaterThan]: '>',
      [BinaryOperator.LessEqual]: '<=',
      [BinaryOperator.GreaterEqual]: '>=',
      [BinaryOperator.And]: '&&',
      [BinaryOperator.Or]: '||',
    };

    const op = operatorMap[node.operator] ?? node.operator;
    return `(${left} ${op} ${right})`;
  }

  visitUnaryExpression(node: UnaryExpression): string {
    const operand = visit(node.operand, this);

    switch (node.operator) {
      case UnaryOperator.Negate:
        return `(-${operand})`;
      case UnaryOperator.Not:
        return `(!${operand})`;
      default:
        return `/* Unknown unary operator */ ${operand}`;
    }
  }

  visitFunctionCall(node: FunctionCall): string {
    const args = node.arguments.map((arg) => visit(arg, this));
    const funcName = node.name;

    // Check for mapped function
    const mapping = FUNCTION_MAPPINGS[funcName];
    if (mapping) {
      if (typeof mapping === 'function') {
        return mapping(args);
      }
      return mapping;
    }

    // Default: keep as function call
    return `${funcName}(${args.join(', ')})`;
  }

  visitIdentifier(node: Identifier): string {
    return node.name;
  }
}

/**
 * Generate TypeScript code from AST
 */
export function generateTypeScript(
  ast: Expression,
  options?: TypeScriptGeneratorOptions
): string {
  const generator = new TypeScriptGenerator(options);
  return visit(ast, generator);
}
