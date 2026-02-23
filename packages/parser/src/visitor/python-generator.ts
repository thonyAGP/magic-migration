/**
 * Magic Unipaas Expression Parser - Python Code Generator
 *
 * Generates Python code from Magic expression AST.
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
 * Options for Python code generation
 */
export interface PythonGeneratorOptions {
  /** Prefix for field references (default: 'fields') */
  fieldPrefix?: string;
  /** Prefix for main program variables (default: 'main_program') */
  mainProgramPrefix?: string;
  /** Whether to use type hints (default: false) */
  includeTypeHints?: boolean;
  /** Use Decimal for numeric (default: true) */
  useDecimal?: boolean;
}

/**
 * Magic function to Python mapping
 * Complete reference: 200 functions with Python equivalents
 */
const FUNCTION_MAPPINGS: Record<string, string | ((args: string[]) => string)> = {
  // ============================================================================
  // STRING FUNCTIONS (20+)
  // ============================================================================
  Trim: (args) => `${args[0]}.strip()`,
  LTrim: (args) => `${args[0]}.lstrip()`,
  RTrim: (args) => `${args[0]}.rstrip()`,
  Upper: (args) => `${args[0]}.upper()`,
  Lower: (args) => `${args[0]}.lower()`,
  Len: (args) => `len(${args[0]})`,
  Left: (args) => `${args[0]}[:${args[1]}]`,
  Right: (args) => `${args[0]}[-${args[1]}:]`,
  Mid: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+${args[2]}]`,
  SubStr: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+${args[2]}]`,
  InStr: (args) => `(${args[0]}.find(${args[1]}) + 1)`,
  Rep: (args) => `${args[0]} * ${args[1]}`,
  RepStr: (args) => `${args[0]}.replace(${args[1]}, ${args[2]})`,
  Fill: (args) => `${args[0]} * ${args[1]}`,
  Chr: (args) => `chr(${args[0]})`,
  ASCIIChr: (args) => `chr(${args[0]})`,
  Asc: (args) => `ord(${args[0]})`,
  ASCIIVal: (args) => `ord(${args[0]})`,
  StrToken: (args) => `${args[0]}.split(${args[2]})[${args[1]} - 1]`,
  StrTokenCnt: (args) => `len(${args[0]}.split(${args[1]}))`,
  StrBuild: (args) => `${args[0]}.format(${args.slice(1).join(', ')})`,
  // Batch 1 additions
  DelStr: (args) => `${args[0]}[:${args[1]}-1] + ${args[0]}[${args[1]}-1+${args[2]}:]`,
  Ins: (args) => `${args[0]}[:${args[2]}-1] + ${args[1]} + ${args[0]}[${args[2]}-1:]`,
  Flip: (args) => `${args[0]}[::-1]`,
  Soundx: (args) => `jellyfish.soundex(${args[0]})`,
  Like: (args) => `fnmatch.fnmatch(${args[0]}, ${args[1]})`,

  // ============================================================================
  // NUMERIC FUNCTIONS (15+)
  // ============================================================================
  Abs: (args) => `abs(${args[0]})`,
  Round: (args) => `round(${args[0]}, ${args[1]})`,
  Trunc: (args) => `math.trunc(${args[0]})`,
  Int: (args) => `int(${args[0]})`,
  Mod: (args) => `(${args[0]} % ${args[1]})`,
  Min: (args) => `min(${args.join(', ')})`,
  Max: (args) => `max(${args.join(', ')})`,
  Pow: (args) => `${args[0]} ** ${args[1]}`,
  Pwr: (args) => `${args[0]} ** ${args[1]}`,
  Sqrt: (args) => `math.sqrt(${args[0]})`,
  Exp: (args) => `math.exp(${args[0]})`,
  Log: (args) => `math.log(${args[0]})`,
  Log10: (args) => `math.log10(${args[0]})`,
  Sin: (args) => `math.sin(${args[0]})`,
  Cos: (args) => `math.cos(${args[0]})`,
  Tan: (args) => `math.tan(${args[0]})`,
  ASin: (args) => `math.asin(${args[0]})`,
  ACos: (args) => `math.acos(${args[0]})`,
  ATan: (args) => `math.atan(${args[0]})`,
  Rand: (args) => `random.randint(0, ${args[0]} - 1)`,

  // ============================================================================
  // DATE FUNCTIONS (22+)
  // ============================================================================
  Date: () => 'date.today()',
  Day: (args) => `${args[0]}.day`,
  Month: (args) => `${args[0]}.month`,
  Year: (args) => `${args[0]}.year`,
  DOW: (args) => `(${args[0]}.isoweekday() % 7 + 1)`,
  CDOW: (args) => `${args[0]}.strftime('%A')`,
  NDOW: (args) => `calendar.day_name[(${args[0]} - 1) % 7]`,
  CMonth: (args) => `${args[0]}.strftime('%B')`,
  NMonth: (args) => `calendar.month_name[${args[0]}]`,
  DStr: (args) => `${args[0]}.strftime(${args[1]})`,
  DVal: (args) => `datetime.strptime(${args[0]}, ${args[1]}).date()`,
  BOM: (args) => `${args[0]}.replace(day=1)`,
  EOM: (args) => `(${args[0]}.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)`,
  BOY: (args) => `${args[0]}.replace(month=1, day=1)`,
  EOY: (args) => `${args[0]}.replace(month=12, day=31)`,
  AddDate: (args) => `${args[0]} + relativedelta(years=${args[1]}, months=${args[2]}, days=${args[3]})`,
  MDate: () => 'session.magic_date',
  Week: (args) => `${args[0]}.isocalendar()[1]`,

  // ============================================================================
  // TIME FUNCTIONS (10+)
  // ============================================================================
  Time: () => 'datetime.now().time()',
  Hour: (args) => `${args[0]}.hour`,
  Minute: (args) => `${args[0]}.minute`,
  Second: (args) => `${args[0]}.second`,
  TStr: (args) => `${args[0]}.strftime(${args[1]})`,
  TVal: (args) => `datetime.strptime(${args[0]}, ${args[1]}).time()`,
  AddTime: (args) => `${args[0]} + timedelta(hours=${args[1]}, minutes=${args[2]}, seconds=${args[3]})`,
  AddDateTime: (args) => `add_datetime(${args.join(', ')})`,
  DifDateTime: (args) => `dif_datetime(${args.join(', ')})`,
  MTime: () => 'session.magic_time',
  Timer: (args) => `(time.perf_counter() if ${args[0]} else timer_start)`,

  // ============================================================================
  // FLOW CONTROL & CONDITIONALS (10+)
  // ============================================================================
  IF: (args) => `(${args[1]} if ${args[0]} else ${args[2]})`,
  IIF: (args) => `(${args[1]} if ${args[0]} else ${args[2]})`,
  CASE: (args) => generateCaseExpression(args),
  Choose: (args) => `[${args.slice(1).join(', ')}][${args[0]} - 1]`,
  IN: (args) => `${args[0]} in [${args[1]}]`,
  CndRange: (args) => `(query.filter(Table.${args[2]}.between(${args[3]}, ${args[4]})) if ${args[0]} else query)`,
  IsNull: (args) => `(${args[0]} is None)`,
  NullVal: (args) => 'None',
  IsDefault: (args) => `(${args[0]} is None)`,
  Range: (args) => `(${args[1]} <= ${args[0]} <= ${args[2]})`,

  // ============================================================================
  // CONVERSION (10+)
  // ============================================================================
  Val: (args) => `Decimal(${args[0]})`,
  Str: (args) => `f"{${args[0]}:{${args[1]}}}"`,
  Fix: (args) => `math.trunc(${args[0]})`,
  Hex: (args) => `hex(${args[0]})[2:].upper()`,
  HVal: (args) => `int(${args[0]}, 16)`,
  NullIf: (args) => `(None if ${args[0]} == ${args[1]} else ${args[0]})`,

  // ============================================================================
  // VARIABLE/PARAMETER (5+)
  // ============================================================================
  GetParam: (args) => `config.get(${args[0]})`,
  SetParam: (args) => `config.set(${args[0]}, ${args[1]})`,
  Translate: (args) => `gettext(${args[0]})`,
  INIGet: (args) => `config[${args[1]}][${args[2]}]`,
  ExpCalc: (args) => `exp_calc(${args[0]})`,

  // ============================================================================
  // DATABASE FUNCTIONS (15+)
  // ============================================================================
  DbName: (args) => `Table.__tablename__`,
  DbRecs: (args) => `session.query(${args[0]}).count()`,
  DbDel: (args) => `session.query(${args[0]}).delete()`,
  Counter: (args) => `counter`,
  EOF: (args) => `is_eof`,
  DbViewRefresh: (args) => `session.expire_all()`,
  DbPos: (args) => `position`,
  DbSize: (args) => `len(records)`,
  DbNext: (args) => `next(iterator, None)`,
  DbPrev: (args) => `move_previous()`,
  Rollback: () => 'session.rollback()',
  Stat: (args) => `get_stat(${args[0]}, ${args[1]})`,
  IsFirstRecordCycle: (args) => `(position == 0)`,

  // ============================================================================
  // SYSTEM FUNCTIONS (15+)
  // ============================================================================
  User: () => 'current_user.username',
  Delay: (args) => `await asyncio.sleep(${args[0]})`,
  Wait: (args) => `await asyncio.sleep(${args[0]})`,
  Sleep: (args) => `await asyncio.sleep(${args[0]} / 1000)`,
  OSEnv: (args) => `os.environ.get(${args[0]}, "")`,
  OSEnvGet: (args) => `os.environ.get(${args[0]}, "")`,
  RunMode: () => 'get_run_mode()',
  IsComponent: () => 'is_component()',
  GetHostName: () => 'socket.gethostname()',
  GetGUID: () => 'str(uuid.uuid4())',
  Prog: () => '__name__',
  Level: (args) => `get_level(${args[0]})`,
  CallProg: (args) => `await ${args[0]}(${args.slice(1).join(', ')})`,

  // ============================================================================
  // UI FUNCTIONS (15+)
  // ============================================================================
  SetCrsr: (args) => `set_cursor(${args[0]})`,
  MsgBox: (args) => `messagebox.showinfo(${args[0]}, ${args[1]})`,
  VerifyBox: (args) => `messagebox.askyesno("", ${args[0]})`,
  InputBox: (args) => `simpledialog.askstring(${args[0]}, ${args[1]})`,
  FormStateClear: (args) => `config.remove_section(${args[0]})`,
  CtrlGoto: (args) => `widget.focus_set()`,
  CtrlRefresh: (args) => `widget.update()`,
  ViewRefresh: (args) => `await load_data()`,
  SetLang: (args) => `gettext.translation(${args[0]}).install()`,
  GetLang: () => 'locale.getlocale()[0]',
  LastPark: () => 'last_focused_widget',

  // ============================================================================
  // FILE FUNCTIONS (15+)
  // ============================================================================
  FileExist: (args) => `os.path.exists(${args[0]})`,
  FileDelete: (args) => `os.remove(${args[0]})`,
  FileCopy: (args) => `shutil.copy(${args[0]}, ${args[1]})`,
  FileRename: (args) => `os.rename(${args[0]}, ${args[1]})`,
  FileSize: (args) => `os.path.getsize(${args[0]})`,
  FileInfo: (args) => `get_file_info(${args[0]}, ${args[1]})`,
  FileListGet: (args) => `glob.glob(os.path.join(${args[0]}, ${args[1]}))`,
  File2Blb: (args) => `open(${args[0]}, 'rb').read()`,
  Blb2File: (args) => `open(${args[1]}, 'wb').write(${args[0]})`,

  // ============================================================================
  // FLOW/ERROR FUNCTIONS (10+)
  // ============================================================================
  Exit: () => 'return',
  ErrMagic: () => 'last_error_code',
  ErrDbms: () => 'last_db_error_code',
  FlwLstRec: () => '(position == len(records) - 1)',
  FlwFstRec: () => '(position == 0)',

  // ============================================================================
  // XML FUNCTIONS (10)
  // ============================================================================
  XMLStr: (args) => `xml.sax.saxutils.escape(${args[0]})`,
  XMLVal: (args) => `xml.sax.saxutils.unescape(${args[0]})`,
  XMLGet: (args) => `tree.xpath(${args[1]})[0].text`,
  XMLCnt: (args) => `len(tree.xpath(${args[1]}))`,
  XMLExist: (args) => `len(tree.xpath(${args[1]})) > 0`,
  XMLInsert: (args) => `xml_insert(${args.join(', ')})`,
  XMLModify: (args) => `tree.xpath(${args[1]})[0].text = ${args[2]}`,
  XMLDelete: (args) => `parent.remove(tree.xpath(${args[1]})[0])`,
  XMLValidate: (args) => `lxml.etree.XMLSchema(${args[1]}).validate(${args[0]})`,
  XMLSetNS: (args) => `namespaces[${args[1]}] = ${args[2]}`,

  // ============================================================================
  // VECTOR FUNCTIONS (4)
  // ============================================================================
  VecGet: (args) => `${args[0]}[${args[1]} - 1]`,
  VecSet: (args) => `${args[0]}[${args[1]} - 1] = ${args[2]}`,
  VecSize: (args) => `len(${args[0]})`,
  VecCellAttr: (args) => `(${args[0]}[${args[1]} - 1] is None)`,

  // ============================================================================
  // BUFFER FUNCTIONS (14)
  // ============================================================================
  BufGetAlpha: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+${args[2]}].decode('utf-8')`,
  BufSetAlpha: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+len(${args[2]})] = ${args[2]}.encode()`,
  BufGetNum: (args) => `struct.unpack('f', ${args[0]}[${args[1]}-1:${args[1]}-1+4])[0]`,
  BufSetNum: (args) => `struct.pack_into('f', ${args[0]}, ${args[1]} - 1, ${args[2]})`,
  BufGetDate: (args) => `datetime.strptime(${args[0]}[${args[1]}-1:${args[1]}+7].decode(), ${args[2]}).date()`,
  BufSetDate: (args) => `${args[0]}[${args[1]}-1:${args[1]}+7] = ${args[2]}.strftime(${args[3]}).encode()`,
  BufGetTime: (args) => `datetime.strptime(${args[0]}[${args[1]}-1:${args[1]}+5].decode(), ${args[2]}).time()`,
  BufSetTime: (args) => `${args[0]}[${args[1]}-1:${args[1]}+5] = ${args[2]}.strftime(${args[3]}).encode()`,
  BufGetLog: (args) => `(${args[0]}[${args[1]} - 1] != 0)`,
  BufSetLog: (args) => `${args[0]}[${args[1]} - 1] = 1 if ${args[2]} else 0`,
  BufGetBlob: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+${args[2]}]`,
  BufSetBlob: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+len(${args[2]})] = ${args[2]}`,
  BufGetUnicode: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+${args[2]}*2].decode('utf-16-le')`,
  BufSetUnicode: (args) => `${args[0]}[${args[1]}-1:] = ${args[2]}.encode('utf-16-le')`,

  // ============================================================================
  // DATAVIEW EXPORT (2)
  // ============================================================================
  DataViewToXML: (args) => `lxml.etree.tostring(element)`,
  DataViewToHTML: (args) => `jinja2.Template(${args[1]}).render(data=records)`,

  // ============================================================================
  // DLL FUNCTIONS (3)
  // ============================================================================
  CallDLL: (args) => `ctypes.windll.${args[0]}.${args[1]}(${args.slice(2).join(', ')})`,
  CallDLLF: (args) => `call_dll_float(${args.join(', ')})`,
  CallDLLS: (args) => `call_dll_string(${args.join(', ')})`,

  // ============================================================================
  // HTTP FUNCTIONS (2)
  // ============================================================================
  CallURL: (args) => `requests.request(${args[1]}, ${args[0]}, headers=${args[2]}, data=${args[3]})`,
  CallProgURL: (args) => `requests.post(f"{${args[0]}}/api/{${args[1]}}", json=[${args.slice(2).join(', ')}])`,

  // ============================================================================
  // COM FUNCTIONS (5)
  // ============================================================================
  COMObjCreate: (args) => `win32com.client.Dispatch(${args[0]})`,
  COMObjRelease: (args) => `del ${args[0]}`,
  COMHandleGet: (args) => `id(${args[0]})`,
  COMHandleSet: (args) => `pythoncom.ObjectFromAddress(${args[1]})`,
  COMError: () => 'pythoncom.com_error[0]',

  // ============================================================================
  // MAIL FUNCTION (1)
  // ============================================================================
  MailSend: (args) => `smtplib.SMTP().send_message(MIMEText(${args[2]}))`,

  // ============================================================================
  // SECURITY FUNCTIONS (3)
  // ============================================================================
  Cipher: (args) => `Fernet(${args[1]}).encrypt(${args[0]})`,
  ClientCertificateAdd: (args) => `requests.get(url, cert=(${args[0]}, ${args[1]}))`,
  ClientCertificateDiscard: (args) => `session.cert = None`,

  // ============================================================================
  // CLIPBOARD FUNCTIONS (3)
  // ============================================================================
  ClipAdd: (args) => `pyperclip.copy(${args[0]})`,
  ClipRead: (args) => `pyperclip.paste()`,
  ClipWrite: (args) => `pyperclip.copy(${args[0]})`,

  // ============================================================================
  // CONTEXT FUNCTIONS (11)
  // ============================================================================
  CtxGetId: (args) => `contextvars.copy_context().get(ctx_id)`,
  CtxGetName: (args) => `context.name`,
  CtxSetName: (args) => `context.name = ${args[1]}`,
  CtxNum: () => 'len(active_contexts)',
  CtxClose: (args) => `context.__exit__(None, None, None)`,
  CtxKill: (args) => `context.cancel()`,
  CtxStat: (args) => `context.status`,
  CtxProg: (args) => `context.current_program`,
  CtxSize: (args) => `sys.getsizeof(context)`,
  CtxLstUse: (args) => `context.last_used`,
  CtxGetAllNames: () => `','.join(c.name for c in contexts)`,

  // ============================================================================
  // WINDOW FUNCTIONS (5)
  // ============================================================================
  WinBox: (args) => `get_window_property(${args[0]}, ${args[1]})`,
  WinHWND: (args) => `window.winfo_id()`,
  WinMaximize: (args) => `window.state('zoomed')`,
  WinMinimize: (args) => `window.state('iconic')`,
  WinRestore: (args) => `window.state('normal')`,

  // ============================================================================
  // MENU FUNCTIONS (6)
  // ============================================================================
  MnuAdd: (args) => `menu.add_command(label=${args[1]})`,
  MnuCheck: (args) => `menu.entryconfig(${args[0]}, checkbutton=${args[1]})`,
  MnuEnabl: (args) => `menu.entryconfig(${args[0]}, state='normal' if ${args[1]} else 'disabled')`,
  MnuName: (args) => `menu.entrycget(${args[0]}, 'label')`,
  MnuRemove: (args) => `menu.delete(${args[0]})`,
  MnuShow: (args) => `menu_show(${args[0]}, ${args[1]})`,

  // ============================================================================
  // CONTROL FUNCTIONS (7)
  // ============================================================================
  CHeight: (args) => `widget.winfo_height()`,
  CWidth: (args) => `widget.winfo_width()`,
  CX: (args) => `widget.winfo_x()`,
  CY: (args) => `widget.winfo_y()`,
  CurRow: (args) => `current_row_index`,
  ClickWX: () => 'event.x',
  ClickWY: () => 'event.y',

  // ============================================================================
  // MULTIMARK FUNCTIONS (4)
  // ============================================================================
  MMCount: (args) => `len(treeview.selection())`,
  MMCurr: (args) => `current_selection_index`,
  MMClear: (args) => `treeview.selection_remove(treeview.selection())`,
  MMStop: () => 'break',

  // ============================================================================
  // LOCKING FUNCTIONS (2)
  // ============================================================================
  Lock: (args) => `lock.acquire()`,
  UnLock: (args) => `lock.release()`,

  // ============================================================================
  // RANGE/LOCATE/SORT FUNCTIONS (6)
  // ============================================================================
  RangeAdd: (args) => `query = query.filter(Table.${args[1]}.between(${args[2]}, ${args[3]}))`,
  RangeReset: (args) => `query = session.query(Table)`,
  LocateAdd: (args) => `query = query.filter(Table.${args[1]} == ${args[2]})`,
  LocateReset: (args) => `locate_criteria = {}`,
  SortAdd: (args) => `query = query.order_by(Table.${args[1]}.asc() if ${args[2]} == 0 else Table.${args[1]}.desc())`,
  SortReset: (args) => `query = session.query(Table)`,

  // ============================================================================
  // I18N/TRANSLATION (3)
  // ============================================================================
  MlsTrans: (args) => `_(${args[0]})`,
  Empty: () => "''",
  NOT: (args) => `not (${args[0]})`,
};

/**
 * Generate CASE expression in Python
 */
function generateCaseExpression(args: string[]): string {
  if (args.length < 4) {
    return `# Invalid CASE\nNone`;
  }

  const expr = args[0];
  const cases: string[] = [];

  for (let i = 1; i < args.length - 1; i += 2) {
    if (i + 1 < args.length) {
      cases.push(`${args[i + 1]} if ${expr} == ${args[i]}`);
    }
  }

  // Default value
  const defaultValue = args.length % 2 === 0 ? args[args.length - 1] : 'None';

  // Use nested ternary for Python
  return `(${cases.join(' else ')} else ${defaultValue})`;
}

/**
 * Python code generator visitor
 */
export class PythonGenerator implements ASTVisitor<string> {
  private readonly options: Required<PythonGeneratorOptions>;

  constructor(options: PythonGeneratorOptions = {}) {
    this.options = {
      fieldPrefix: options.fieldPrefix ?? 'fields',
      mainProgramPrefix: options.mainProgramPrefix ?? 'main_program',
      includeTypeHints: options.includeTypeHints ?? false,
      useDecimal: options.useDecimal ?? true,
    };
  }

  visitNumberLiteral(node: NumberLiteral): string {
    if (this.options.useDecimal && node.raw.includes('.')) {
      return `Decimal('${node.raw}')`;
    }
    return node.raw;
  }

  visitStringLiteral(node: StringLiteral): string {
    const escaped = node.value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n');
    return `'${escaped}'`;
  }

  visitBooleanLiteral(node: BooleanLiteral): string {
    return node.value ? 'True' : 'False';
  }

  visitFieldReference(node: FieldReference): string {
    const { context, field } = node;

    // Context 0: Current task variables
    if (context === 0) {
      return `${this.options.fieldPrefix}.v${field}`;
    }

    // Context 32768: Main program variables
    if (context === 32768) {
      return `${this.options.mainProgramPrefix}.v${field}`;
    }

    // Context 1-N: Parent task parameters
    if (context >= 1 && context < 32768) {
      return `parent${context}.p${field}`;
    }

    // Generic fallback
    return `get_field(${context}, ${field})`;
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
        return `get_variable(${comp}, ${id})`;

      case SpecialRefType.FORM:
        return `forms[${id}]`;

      default:
        return `# Unknown ref type: ${refType}\nNone`;
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
      [BinaryOperator.Equal]: '==',
      [BinaryOperator.NotEqual]: '!=',
      [BinaryOperator.LessThan]: '<',
      [BinaryOperator.GreaterThan]: '>',
      [BinaryOperator.LessEqual]: '<=',
      [BinaryOperator.GreaterEqual]: '>=',
      [BinaryOperator.And]: 'and',
      [BinaryOperator.Or]: 'or',
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
        return `(not ${operand})`;
      default:
        return `# Unknown unary operator\n${operand}`;
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

    // Default: keep as function call (snake_case)
    const snakeName = funcName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    return `${snakeName}(${args.join(', ')})`;
  }

  visitIdentifier(node: Identifier): string {
    // snake_case for Python
    return node.name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}

/**
 * Generate Python code from AST
 */
export function generatePython(
  ast: Expression,
  options?: PythonGeneratorOptions
): string {
  const generator = new PythonGenerator(options);
  return visit(ast, generator);
}

/**
 * Generate Python imports needed for the generated code
 */
export function getPythonImports(): string {
  return `from decimal import Decimal
from datetime import date, datetime, time, timedelta
import math
import random
import os
import shutil
import asyncio
`;
}
