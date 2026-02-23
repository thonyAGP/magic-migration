/**
 * Magic Unipaas Expression Parser - C# Code Generator
 *
 * Generates C# code from Magic expression AST.
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
 * Options for C# code generation
 */
export interface CSharpGeneratorOptions {
  /** Prefix for field references (default: 'Fields') */
  fieldPrefix?: string;
  /** Prefix for main program variables (default: 'MainProgram') */
  mainProgramPrefix?: string;
  /** Whether to use nullable reference types (default: true) */
  useNullable?: boolean;
  /** Whether to use DateOnly/TimeOnly (.NET 6+) (default: true) */
  useDateOnly?: boolean;
}

/**
 * Magic function to C# mapping
 * Complete reference: 200 functions with C# equivalents (.NET 6+)
 */
const FUNCTION_MAPPINGS: Record<string, string | ((args: string[]) => string)> = {
  // ============================================================================
  // STRING FUNCTIONS (20+)
  // ============================================================================
  Trim: (args) => `${args[0]}.Trim()`,
  LTrim: (args) => `${args[0]}.TrimStart()`,
  RTrim: (args) => `${args[0]}.TrimEnd()`,
  Upper: (args) => `${args[0]}.ToUpper()`,
  Lower: (args) => `${args[0]}.ToLower()`,
  Len: (args) => `${args[0]}.Length`,
  Left: (args) => `${args[0]}.Substring(0, Math.Min(${args[1]}, ${args[0]}.Length))`,
  Right: (args) => `${args[0]}.Substring(Math.Max(0, ${args[0]}.Length - ${args[1]}))`,
  Mid: (args) => `${args[0]}.Substring(${args[1]} - 1, ${args[2]})`,
  SubStr: (args) => `${args[0]}.Substring(${args[1]} - 1, ${args[2]})`,
  InStr: (args) => `(${args[0]}.IndexOf(${args[1]}) + 1)`,
  Rep: (args) => `string.Concat(Enumerable.Repeat(${args[0]}, ${args[1]}))`,
  RepStr: (args) => `${args[0]}.Replace(${args[1]}, ${args[2]})`,
  Fill: (args) => `new string(${args[0]}[0], ${args[1]})`,
  Chr: (args) => `((char)${args[0]}).ToString()`,
  ASCIIChr: (args) => `((char)${args[0]}).ToString()`,
  Asc: (args) => `(int)${args[0]}[0]`,
  ASCIIVal: (args) => `(int)${args[0]}[0]`,
  StrToken: (args) => `${args[0]}.Split(${args[2]})[${args[1]} - 1]`,
  StrTokenCnt: (args) => `${args[0]}.Split(${args[1]}).Length`,
  StrBuild: (args) => `string.Format(${args.join(', ')})`,
  // Batch 1 additions
  DelStr: (args) => `${args[0]}.Remove(${args[1]} - 1, ${args[2]})`,
  Ins: (args) => `${args[0]}.Insert(${args[2]} - 1, ${args[1]})`,
  Flip: (args) => `new string(${args[0]}.Reverse().ToArray())`,
  Soundx: (args) => `Soundex(${args[0]})`,
  Like: (args) => `Regex.IsMatch(${args[0]}, "^" + Regex.Escape(${args[1]}).Replace("\\\\*", ".*").Replace("\\\\?", ".") + "$")`,

  // ============================================================================
  // NUMERIC FUNCTIONS (15+)
  // ============================================================================
  Abs: (args) => `Math.Abs(${args[0]})`,
  Round: (args) => `Math.Round(${args[0]}, ${args[1]})`,
  Trunc: (args) => `Math.Truncate(${args[0]} * Math.Pow(10, ${args[1]})) / Math.Pow(10, ${args[1]})`,
  Int: (args) => `Math.Floor(${args[0]})`,
  Mod: (args) => `(${args[0]} % ${args[1]})`,
  Min: (args) => `Math.Min(${args.join(', ')})`,
  Max: (args) => `Math.Max(${args.join(', ')})`,
  Pow: (args) => `Math.Pow(${args[0]}, ${args[1]})`,
  Pwr: (args) => `Math.Pow(${args[0]}, ${args[1]})`,
  Sqrt: (args) => `Math.Sqrt(${args[0]})`,
  Exp: (args) => `Math.Exp(${args[0]})`,
  Log: (args) => `Math.Log(${args[0]})`,
  Log10: (args) => `Math.Log10(${args[0]})`,
  Sin: (args) => `Math.Sin(${args[0]})`,
  Cos: (args) => `Math.Cos(${args[0]})`,
  Tan: (args) => `Math.Tan(${args[0]})`,
  ASin: (args) => `Math.Asin(${args[0]})`,
  ACos: (args) => `Math.Acos(${args[0]})`,
  ATan: (args) => `Math.Atan(${args[0]})`,
  Rand: (args) => `new Random().Next(${args[0]})`,

  // ============================================================================
  // DATE FUNCTIONS (22+)
  // ============================================================================
  Date: () => 'DateOnly.FromDateTime(DateTime.Now)',
  Day: (args) => `${args[0]}.Day`,
  Month: (args) => `${args[0]}.Month`,
  Year: (args) => `${args[0]}.Year`,
  DOW: (args) => `((int)${args[0]}.DayOfWeek + 1)`,
  CDOW: (args) => `${args[0]}.ToString("dddd", CultureInfo.CurrentCulture)`,
  NDOW: (args) => `CultureInfo.CurrentCulture.DateTimeFormat.DayNames[(${args[0]} - 1) % 7]`,
  CMonth: (args) => `${args[0]}.ToString("MMMM", CultureInfo.CurrentCulture)`,
  NMonth: (args) => `CultureInfo.CurrentCulture.DateTimeFormat.MonthNames[${args[0]} - 1]`,
  DStr: (args) => `${args[0]}.ToString(${args[1]})`,
  DVal: (args) => `DateOnly.ParseExact(${args[0]}, ${args[1]})`,
  BOM: (args) => `new DateOnly(${args[0]}.Year, ${args[0]}.Month, 1)`,
  EOM: (args) => `new DateOnly(${args[0]}.Year, ${args[0]}.Month, DateTime.DaysInMonth(${args[0]}.Year, ${args[0]}.Month))`,
  BOY: (args) => `new DateOnly(${args[0]}.Year, 1, 1)`,
  EOY: (args) => `new DateOnly(${args[0]}.Year, 12, 31)`,
  AddDate: (args) => `${args[0]}.AddYears(${args[1]}).AddMonths(${args[2]}).AddDays(${args[3]})`,
  MDate: () => '_session.MagicDate',
  Week: (args) => `CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(${args[0]}.ToDateTime(TimeOnly.MinValue), CalendarWeekRule.FirstDay, DayOfWeek.Monday)`,

  // ============================================================================
  // TIME FUNCTIONS (10+)
  // ============================================================================
  Time: () => 'TimeOnly.FromDateTime(DateTime.Now)',
  Hour: (args) => `${args[0]}.Hour`,
  Minute: (args) => `${args[0]}.Minute`,
  Second: (args) => `${args[0]}.Second`,
  TStr: (args) => `${args[0]}.ToString(${args[1]})`,
  TVal: (args) => `TimeOnly.ParseExact(${args[0]}, ${args[1]})`,
  AddTime: (args) => `${args[0]}.Add(new TimeSpan(${args[1]}, ${args[2]}, ${args[3]}))`,
  AddDateTime: (args) => `AddDateTime(${args.join(', ')})`,
  DifDateTime: (args) => `DifDateTime(${args.join(', ')})`,
  MTime: () => '_session.MagicTime',
  Timer: (args) => `(${args[0]} ? (_stopwatch.Restart(), 0) : _stopwatch.Elapsed.TotalSeconds)`,

  // ============================================================================
  // FLOW CONTROL & CONDITIONALS (10+)
  // ============================================================================
  IF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  IIF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  CASE: (args) => generateCaseExpression(args),
  Choose: (args) => `new[] { ${args.slice(1).join(', ')} }[${args[0]} - 1]`,
  IN: (args) => `new[] { ${args[1]} }.Contains(${args[0]})`,
  CndRange: (args) => `(${args[0]} ? query.Where(x => x.${args[2]} >= ${args[3]} && x.${args[2]} <= ${args[4]}) : query)`,
  IsNull: (args) => `(${args[0]} == null)`,
  NullVal: (args) => 'default',
  IsDefault: (args) => `EqualityComparer<T>.Default.Equals(${args[0]}, default)`,
  Range: (args) => `(${args[0]} >= ${args[1]} && ${args[0]} <= ${args[2]})`,

  // ============================================================================
  // CONVERSION (10+)
  // ============================================================================
  Val: (args) => `decimal.Parse(${args[0]})`,
  Str: (args) => `${args[0]}.ToString(${args[1]})`,
  Fix: (args) => `Math.Truncate(${args[0]})`,
  Hex: (args) => `${args[0]}.ToString("X")`,
  HVal: (args) => `Convert.ToInt32(${args[0]}, 16)`,
  NullIf: (args) => `(${args[0]} == ${args[1]} ? null : ${args[0]})`,

  // ============================================================================
  // VARIABLE/PARAMETER (5+)
  // ============================================================================
  GetParam: (args) => `Configuration[${args[0]}]`,
  SetParam: (args) => `SetParam(${args[0]}, ${args[1]})`,
  Translate: (args) => `_localizer[${args[0]}]`,
  INIGet: (args) => `Configuration.GetSection(${args[1]})[${args[2]}]`,
  ExpCalc: (args) => `ExpCalc(${args[0]})`,

  // ============================================================================
  // DATABASE FUNCTIONS (15+)
  // ============================================================================
  DbName: (args) => `_context.Model.FindEntityType(typeof(T))?.GetTableName()`,
  DbRecs: (args) => `await _context.${args[0]}.CountAsync()`,
  DbDel: (args) => `await _context.${args[0]}.ExecuteDeleteAsync()`,
  Counter: (args) => `_counter`,
  EOF: (args) => `!_reader.HasRows`,
  DbViewRefresh: (args) => `await _context.Database.ExecuteSqlRawAsync("SELECT 1")`,
  DbPos: (args) => `_position`,
  DbSize: (args) => `_records.Count`,
  DbNext: (args) => `_reader.Read()`,
  DbPrev: (args) => `MovePrevious()`,
  Rollback: () => 'await _transaction.RollbackAsync()',
  Stat: (args) => `GetStat(${args[0]}, ${args[1]})`,
  IsFirstRecordCycle: (args) => `(_position == 0)`,

  // ============================================================================
  // SYSTEM FUNCTIONS (15+)
  // ============================================================================
  User: () => 'User.Identity?.Name ?? Environment.UserName',
  Delay: (args) => `await Task.Delay(TimeSpan.FromSeconds(${args[0]}))`,
  Wait: (args) => `await Task.Delay(TimeSpan.FromSeconds(${args[0]}))`,
  Sleep: (args) => `await Task.Delay(${args[0]})`,
  OSEnv: (args) => `Environment.GetEnvironmentVariable(${args[0]}) ?? ""`,
  OSEnvGet: (args) => `Environment.GetEnvironmentVariable(${args[0]}) ?? ""`,
  RunMode: () => 'GetRunMode()',
  IsComponent: () => 'IsComponent()',
  GetHostName: () => 'Environment.MachineName',
  GetGUID: () => 'Guid.NewGuid().ToString()',
  Prog: () => 'nameof(CurrentClass)',
  Level: (args) => `GetLevel(${args[0]})`,
  CallProg: (args) => `await _service.${args[0]}Async(${args.slice(1).join(', ')})`,

  // ============================================================================
  // UI FUNCTIONS (15+)
  // ============================================================================
  SetCrsr: (args) => `Cursor.Current = ${args[0]} == 1 ? Cursors.WaitCursor : Cursors.Default`,
  MsgBox: (args) => `MessageBox.Show(${args[1]}, ${args[0]})`,
  VerifyBox: (args) => `MessageBox.Show(${args[0]}, "", MessageBoxButtons.YesNo) == DialogResult.Yes`,
  InputBox: (args) => `Microsoft.VisualBasic.Interaction.InputBox(${args[1]}, ${args[0]}, ${args[2]})`,
  FormStateClear: (args) => `Properties.Settings.Default.Remove(${args[0]})`,
  CtrlGoto: (args) => `Controls[${args[0]}]?.Focus()`,
  CtrlRefresh: (args) => `Controls[${args[0]}]?.Refresh()`,
  ViewRefresh: (args) => `await LoadDataAsync()`,
  SetLang: (args) => `Thread.CurrentThread.CurrentUICulture = new CultureInfo(${args[0]})`,
  GetLang: () => 'CultureInfo.CurrentUICulture.TwoLetterISOLanguageName',
  LastPark: () => '_lastFocusedControl?.Name',

  // ============================================================================
  // FILE FUNCTIONS (15+)
  // ============================================================================
  FileExist: (args) => `File.Exists(${args[0]})`,
  FileDelete: (args) => `File.Delete(${args[0]})`,
  FileCopy: (args) => `File.Copy(${args[0]}, ${args[1]})`,
  FileRename: (args) => `File.Move(${args[0]}, ${args[1]})`,
  FileSize: (args) => `new FileInfo(${args[0]}).Length`,
  FileInfo: (args) => `GetFileInfo(${args[0]}, ${args[1]})`,
  FileListGet: (args) => `Directory.GetFiles(${args[0]}, ${args[1]})`,
  File2Blb: (args) => `await File.ReadAllBytesAsync(${args[0]})`,
  Blb2File: (args) => `await File.WriteAllBytesAsync(${args[1]}, ${args[0]})`,

  // ============================================================================
  // FLOW/ERROR FUNCTIONS (10+)
  // ============================================================================
  Exit: () => 'return',
  ErrMagic: () => '_lastErrorCode',
  ErrDbms: () => '(exception as SqlException)?.Number ?? 0',
  FlwLstRec: () => '(_position == _records.Count - 1)',
  FlwFstRec: () => '(_position == 0)',

  // ============================================================================
  // XML FUNCTIONS (10)
  // ============================================================================
  XMLStr: (args) => `SecurityElement.Escape(${args[0]})`,
  XMLVal: (args) => `WebUtility.HtmlDecode(${args[0]})`,
  XMLGet: (args) => `${args[0]}.SelectSingleNode(${args[1]})?.InnerText`,
  XMLCnt: (args) => `${args[0]}.SelectNodes(${args[1]})?.Count ?? 0`,
  XMLExist: (args) => `${args[0]}.SelectSingleNode(${args[1]}) != null`,
  XMLInsert: (args) => `XmlInsert(${args.join(', ')})`,
  XMLModify: (args) => `${args[0]}.SelectSingleNode(${args[1]}).InnerText = ${args[2]}`,
  XMLDelete: (args) => `${args[0]}.SelectSingleNode(${args[1]})?.ParentNode?.RemoveChild(${args[0]}.SelectSingleNode(${args[1]}))`,
  XMLValidate: (args) => `XmlValidate(${args[0]}, ${args[1]})`,
  XMLSetNS: (args) => `_namespaceManager.AddNamespace(${args[1]}, ${args[2]})`,

  // ============================================================================
  // VECTOR FUNCTIONS (4)
  // ============================================================================
  VecGet: (args) => `${args[0]}[${args[1]} - 1]`,
  VecSet: (args) => `${args[0]}[${args[1]} - 1] = ${args[2]}`,
  VecSize: (args) => `${args[0]}.Count`,
  VecCellAttr: (args) => `(${args[0]}[${args[1]} - 1] == null)`,

  // ============================================================================
  // BUFFER FUNCTIONS (14)
  // ============================================================================
  BufGetAlpha: (args) => `Encoding.UTF8.GetString(${args[0]}, ${args[1]} - 1, ${args[2]})`,
  BufSetAlpha: (args) => `Encoding.UTF8.GetBytes(${args[2]}).CopyTo(${args[0]}, ${args[1]} - 1)`,
  BufGetNum: (args) => `BitConverter.ToSingle(${args[0]}, ${args[1]} - 1)`,
  BufSetNum: (args) => `BitConverter.GetBytes(${args[2]}).CopyTo(${args[0]}, ${args[1]} - 1)`,
  BufGetDate: (args) => `DateOnly.ParseExact(Encoding.UTF8.GetString(${args[0]}, ${args[1]} - 1, 8), ${args[2]})`,
  BufSetDate: (args) => `Encoding.UTF8.GetBytes(${args[2]}.ToString(${args[3]})).CopyTo(${args[0]}, ${args[1]} - 1)`,
  BufGetTime: (args) => `TimeOnly.ParseExact(Encoding.UTF8.GetString(${args[0]}, ${args[1]} - 1, 6), ${args[2]})`,
  BufSetTime: (args) => `Encoding.UTF8.GetBytes(${args[2]}.ToString(${args[3]})).CopyTo(${args[0]}, ${args[1]} - 1)`,
  BufGetLog: (args) => `(${args[0]}[${args[1]} - 1] != 0)`,
  BufSetLog: (args) => `${args[0]}[${args[1]} - 1] = (byte)(${args[2]} ? 1 : 0)`,
  BufGetBlob: (args) => `${args[0]}.Skip(${args[1]} - 1).Take(${args[2]}).ToArray()`,
  BufSetBlob: (args) => `${args[2]}.CopyTo(${args[0]}, ${args[1]} - 1)`,
  BufGetUnicode: (args) => `Encoding.Unicode.GetString(${args[0]}, ${args[1]} - 1, ${args[2]} * 2)`,
  BufSetUnicode: (args) => `Encoding.Unicode.GetBytes(${args[2]}).CopyTo(${args[0]}, ${args[1]} - 1)`,

  // ============================================================================
  // DATAVIEW EXPORT (2)
  // ============================================================================
  DataViewToXML: (args) => `DataViewToXML(${args[0]}, ${args[1]})`,
  DataViewToHTML: (args) => `DataViewToHTML(${args[0]}, ${args[1]})`,

  // ============================================================================
  // DLL FUNCTIONS (3)
  // ============================================================================
  CallDLL: (args) => `CallDLL(${args.join(', ')})`,
  CallDLLF: (args) => `CallDLLFloat(${args.join(', ')})`,
  CallDLLS: (args) => `CallDLLString(${args.join(', ')})`,

  // ============================================================================
  // HTTP FUNCTIONS (2)
  // ============================================================================
  CallURL: (args) => `await _httpClient.SendAsync(new HttpRequestMessage(new HttpMethod(${args[1]}), ${args[0]}) { Content = new StringContent(${args[3]}) })`,
  CallProgURL: (args) => `await _httpClient.PostAsJsonAsync($"{${args[0]}}/api/{${args[1]}}", new object[] { ${args.slice(2).join(', ')} })`,

  // ============================================================================
  // COM FUNCTIONS (5)
  // ============================================================================
  COMObjCreate: (args) => `Activator.CreateInstance(Type.GetTypeFromProgID(${args[0]}))`,
  COMObjRelease: (args) => `Marshal.ReleaseComObject(${args[0]})`,
  COMHandleGet: (args) => `Marshal.GetIUnknownForObject(${args[0]}).ToInt64()`,
  COMHandleSet: (args) => `Marshal.GetObjectForIUnknown(new IntPtr(${args[1]}))`,
  COMError: () => 'Marshal.GetHRForLastWin32Error()',

  // ============================================================================
  // MAIL FUNCTION (1)
  // ============================================================================
  MailSend: (args) => `await _smtpClient.SendMailAsync(new MailMessage { To = { ${args[0]} }, Subject = ${args[1]}, Body = ${args[2]} })`,

  // ============================================================================
  // SECURITY FUNCTIONS (3)
  // ============================================================================
  Cipher: (args) => `Cipher(${args[0]}, ${args[1]}, ${args[2]})`,
  ClientCertificateAdd: (args) => `_handler.ClientCertificates.Add(new X509Certificate2(${args[0]}, ${args[1]}))`,
  ClientCertificateDiscard: (args) => `_handler.ClientCertificates.Remove(_handler.ClientCertificates.Find(X509FindType.FindBySubjectName, ${args[0]}, false)[0])`,

  // ============================================================================
  // CLIPBOARD FUNCTIONS (3)
  // ============================================================================
  ClipAdd: (args) => `Clipboard.SetText(${args[0]})`,
  ClipRead: (args) => `Clipboard.GetText()`,
  ClipWrite: (args) => `Clipboard.SetText(${args[0]})`,

  // ============================================================================
  // CONTEXT FUNCTIONS (11)
  // ============================================================================
  CtxGetId: (args) => `Activity.Current?.Id`,
  CtxGetName: (args) => `Activity.Current?.DisplayName`,
  CtxSetName: (args) => `Activity.Current.DisplayName = ${args[1]}`,
  CtxNum: () => '_contextManager.Count',
  CtxClose: (args) => `_context.Dispose()`,
  CtxKill: (args) => `_cts.Cancel(); _context.Dispose()`,
  CtxStat: (args) => `_context.State`,
  CtxProg: (args) => `_context.CurrentOperation`,
  CtxSize: (args) => `GC.GetTotalMemory(false)`,
  CtxLstUse: (args) => `_context.LastAccessTime`,
  CtxGetAllNames: () => `string.Join(",", _contexts.Select(c => c.Name))`,

  // ============================================================================
  // WINDOW FUNCTIONS (5)
  // ============================================================================
  WinBox: (args) => `GetWindowProperty(${args[0]}, ${args[1]})`,
  WinHWND: (args) => `${args[0]}.Handle.ToInt64()`,
  WinMaximize: (args) => `${args[0]}.WindowState = FormWindowState.Maximized`,
  WinMinimize: (args) => `${args[0]}.WindowState = FormWindowState.Minimized`,
  WinRestore: (args) => `${args[0]}.WindowState = FormWindowState.Normal`,

  // ============================================================================
  // MENU FUNCTIONS (6)
  // ============================================================================
  MnuAdd: (args) => `_menuStrip.Items.Add(new ToolStripMenuItem(${args[1]}))`,
  MnuCheck: (args) => `((ToolStripMenuItem)_menuStrip.Items[${args[0]}]).Checked = ${args[1]}`,
  MnuEnabl: (args) => `_menuStrip.Items[${args[0]}].Enabled = ${args[1]}`,
  MnuName: (args) => `_menuStrip.Items[${args[0]}].Text`,
  MnuRemove: (args) => `_menuStrip.Items.RemoveAt(${args[0]})`,
  MnuShow: (args) => `_menuStrip.Items[${args[0]}].Visible = ${args[1]}`,

  // ============================================================================
  // CONTROL FUNCTIONS (7)
  // ============================================================================
  CHeight: (args) => `Controls[${args[0]}]?.Height ?? 0`,
  CWidth: (args) => `Controls[${args[0]}]?.Width ?? 0`,
  CX: (args) => `Controls[${args[0]}]?.Left ?? 0`,
  CY: (args) => `Controls[${args[0]}]?.Top ?? 0`,
  CurRow: (args) => `_dataGridView.CurrentRow?.Index ?? -1`,
  ClickWX: () => '_lastMouseEventArgs.X',
  ClickWY: () => '_lastMouseEventArgs.Y',

  // ============================================================================
  // MULTIMARK FUNCTIONS (4)
  // ============================================================================
  MMCount: (args) => `_dataGridView.SelectedRows.Count`,
  MMCurr: (args) => `_currentMarkedRowIndex`,
  MMClear: (args) => `_dataGridView.ClearSelection()`,
  MMStop: () => 'return',

  // ============================================================================
  // LOCKING FUNCTIONS (2)
  // ============================================================================
  Lock: (args) => `await _semaphore.WaitAsync()`,
  UnLock: (args) => `_semaphore.Release()`,

  // ============================================================================
  // RANGE/LOCATE/SORT FUNCTIONS (6)
  // ============================================================================
  RangeAdd: (args) => `query = query.Where(x => x.${args[1]} >= ${args[2]} && x.${args[1]} <= ${args[3]})`,
  RangeReset: (args) => `query = _context.${args[0]}.AsQueryable()`,
  LocateAdd: (args) => `query = query.Where(x => x.${args[1]} == ${args[2]})`,
  LocateReset: (args) => `_locateParams.Clear()`,
  SortAdd: (args) => `query = ${args[2]} == 0 ? query.OrderBy(x => x.${args[1]}) : query.OrderByDescending(x => x.${args[1]})`,
  SortReset: (args) => `query = _context.${args[0]}.AsQueryable()`,

  // ============================================================================
  // I18N/TRANSLATION (3)
  // ============================================================================
  MlsTrans: (args) => `_localizer[${args[0]}]`,
  Empty: () => 'string.Empty',
  NOT: (args) => `!(${args[0]})`,
};

/**
 * Generate CASE expression in C#
 */
function generateCaseExpression(args: string[]): string {
  if (args.length < 4) {
    return `/* Invalid CASE */ null`;
  }

  const expr = args[0];
  const cases: string[] = [];

  for (let i = 1; i < args.length - 1; i += 2) {
    if (i + 1 < args.length) {
      cases.push(`${expr} == ${args[i]} ? ${args[i + 1]}`);
    }
  }

  // Default value
  const defaultValue = args.length % 2 === 0 ? args[args.length - 1] : 'default';

  return `(${cases.join(' : ')} : ${defaultValue})`;
}

/**
 * C# code generator visitor
 */
export class CSharpGenerator implements ASTVisitor<string> {
  private readonly options: Required<CSharpGeneratorOptions>;

  constructor(options: CSharpGeneratorOptions = {}) {
    this.options = {
      fieldPrefix: options.fieldPrefix ?? 'Fields',
      mainProgramPrefix: options.mainProgramPrefix ?? 'MainProgram',
      useNullable: options.useNullable ?? true,
      useDateOnly: options.useDateOnly ?? true,
    };
  }

  visitNumberLiteral(node: NumberLiteral): string {
    // Use decimal suffix for precision
    if (node.raw.includes('.')) {
      return `${node.raw}m`;
    }
    return node.raw;
  }

  visitStringLiteral(node: StringLiteral): string {
    const escaped = node.value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }

  visitBooleanLiteral(node: BooleanLiteral): string {
    return node.value ? 'true' : 'false';
  }

  visitFieldReference(node: FieldReference): string {
    const { context, field } = node;
    const nullCheck = this.options.useNullable ? '?' : '';

    // Context 0: Current task variables
    if (context === 0) {
      return `${this.options.fieldPrefix}${nullCheck}.V${field}`;
    }

    // Context 32768: Main program variables
    if (context === 32768) {
      return `${this.options.mainProgramPrefix}${nullCheck}.V${field}`;
    }

    // Context 1-N: Parent task parameters
    if (context >= 1 && context < 32768) {
      return `Parent${context}${nullCheck}.P${field}`;
    }

    // Generic fallback
    return `GetField(${context}, ${field})`;
  }

  visitSpecialReference(node: SpecialReference): string {
    const { refType, id, comp } = node;

    switch (refType) {
      case SpecialRefType.PROG:
        return `Programs[${id}]`;

      case SpecialRefType.DSOURCE:
        return `Tables[${comp}][${id}]`;

      case SpecialRefType.VAR:
        if (comp === 0) {
          return `${this.options.fieldPrefix}.V${id}`;
        }
        return `GetVariable(${comp}, ${id})`;

      case SpecialRefType.FORM:
        return `Forms[${id}]`;

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
      [BinaryOperator.Power]: '/* ^ */ Math.Pow',
      [BinaryOperator.Mod]: '%',
      [BinaryOperator.Concat]: '+',
      [BinaryOperator.Equal]: '==',
      [BinaryOperator.NotEqual]: '!=',
      [BinaryOperator.LessThan]: '<',
      [BinaryOperator.GreaterThan]: '>',
      [BinaryOperator.LessEqual]: '<=',
      [BinaryOperator.GreaterEqual]: '>=',
      [BinaryOperator.And]: '&&',
      [BinaryOperator.Or]: '||',
    };

    // Special case for power operator
    if (node.operator === BinaryOperator.Power) {
      return `Math.Pow(${left}, ${right})`;
    }

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

    // Default: keep as method call (PascalCase)
    const pascalName = funcName.charAt(0).toUpperCase() + funcName.slice(1);
    return `${pascalName}(${args.join(', ')})`;
  }

  visitIdentifier(node: Identifier): string {
    // PascalCase for C#
    return node.name.charAt(0).toUpperCase() + node.name.slice(1);
  }
}

/**
 * Generate C# code from AST
 */
export function generateCSharp(
  ast: Expression,
  options?: CSharpGeneratorOptions
): string {
  const generator = new CSharpGenerator(options);
  return visit(ast, generator);
}
