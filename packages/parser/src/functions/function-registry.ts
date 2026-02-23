/**
 * Magic Unipaas Expression Parser - Function Registry
 *
 * Registry of all Magic built-in functions with metadata for validation
 * and code generation.
 */

/**
 * Function parameter type
 */
export enum ParamType {
  Alpha = 'A',      // String
  Numeric = 'N',    // Number
  Logical = 'B',    // Boolean
  Date = 'D',       // Date
  Time = 'T',       // Time
  Blob = 'L',       // BLOB
  Any = '*',        // Any type
  Unicode = 'U',    // Unicode string
}

/**
 * Function metadata
 */
export interface MagicFunction {
  /** Function name (case-insensitive in Magic) */
  name: string;
  /** Minimum number of arguments */
  minArgs: number;
  /** Maximum number of arguments (-1 for unlimited) */
  maxArgs: number;
  /** Return type */
  returnType: ParamType;
  /** Parameter types (for validation) */
  paramTypes?: ParamType[];
  /** Category for documentation */
  category: FunctionCategory;
  /** Brief description */
  description: string;
}

/**
 * Function categories
 */
export enum FunctionCategory {
  String = 'String',
  Numeric = 'Numeric',
  Date = 'Date',
  Time = 'Time',
  Logical = 'Logical',
  Flow = 'Flow',
  Database = 'Database',
  System = 'System',
  IO = 'IO',
  UI = 'UI',
  Blob = 'Blob',
  Conversion = 'Conversion',
  Variable = 'Variable',
  Environment = 'Environment',
  Error = 'Error',
  XML = 'XML',
  Vector = 'Vector',
  Buffer = 'Buffer',
  DLL = 'DLL',
  HTTP = 'HTTP',
  COM = 'COM',
  Mail = 'Mail',
  Security = 'Security',
  Clipboard = 'Clipboard',
  Context = 'Context',
  Window = 'Window',
  Menu = 'Menu',
  Control = 'Control',
  MultiMark = 'MultiMark',
  Locking = 'Locking',
  I18N = 'I18N',
}

/**
 * Magic function definitions
 */
const MAGIC_FUNCTIONS: MagicFunction[] = [
  // ===== String Functions =====
  { name: 'Trim', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Remove leading and trailing spaces' },
  { name: 'LTrim', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Remove leading spaces' },
  { name: 'RTrim', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Remove trailing spaces' },
  { name: 'Upper', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Convert to uppercase' },
  { name: 'Lower', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Convert to lowercase' },
  { name: 'Len', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.String, description: 'String length' },
  { name: 'Left', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Left substring' },
  { name: 'Right', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Right substring' },
  { name: 'Mid', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Middle substring' },
  { name: 'SubStr', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Substring extraction' },
  { name: 'InStr', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.String, description: 'Find position of substring' },
  { name: 'Rep', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Repeat string N times' },
  { name: 'Fill', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Create string of N chars' },
  { name: 'Flip', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Reverse string' },
  { name: 'DelStr', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Delete substring' },
  { name: 'InsStr', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Insert substring' },
  { name: 'RepStr', minArgs: 4, maxArgs: 4, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Replace substring' },
  { name: 'StrToken', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Get token from delimited string' },
  { name: 'StrTokenCnt', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.String, description: 'Count tokens in string' },
  { name: 'StrTokenIdx', minArgs: 3, maxArgs: 3, returnType: ParamType.Numeric, category: FunctionCategory.String, description: 'Find token index' },
  { name: 'StrBuild', minArgs: 1, maxArgs: -1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Build string from parts' },
  { name: 'Chr', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Character from ASCII code' },
  { name: 'Asc', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.String, description: 'ASCII code of character' },
  { name: 'Ins', minArgs: 4, maxArgs: 4, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Insert string at position' },
  { name: 'Soundx', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Soundex phonetic algorithm' },
  { name: 'Like', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.String, description: 'Pattern matching' },
  { name: 'ASCIIVal', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.String, description: 'ASCII value of first character' },

  // ===== Numeric Functions =====
  { name: 'Abs', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Absolute value' },
  { name: 'Round', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Round to decimals' },
  { name: 'Trunc', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Truncate to decimals' },
  { name: 'Int', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Integer part' },
  { name: 'Mod', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Modulo' },
  { name: 'Min', minArgs: 2, maxArgs: -1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Minimum value' },
  { name: 'Max', minArgs: 2, maxArgs: -1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Maximum value' },
  { name: 'Pow', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Power' },
  { name: 'Sqrt', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Square root' },
  { name: 'Exp', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Exponential' },
  { name: 'Log', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Natural logarithm' },
  { name: 'Log10', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Base-10 logarithm' },
  { name: 'Sin', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Sine' },
  { name: 'Cos', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Cosine' },
  { name: 'Tan', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Tangent' },
  { name: 'ASin', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Arc sine' },
  { name: 'ACos', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Arc cosine' },
  { name: 'ATan', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Arc tangent' },
  { name: 'Rand', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Numeric, description: 'Random number' },

  // ===== Date Functions =====
  { name: 'Date', minArgs: 0, maxArgs: 0, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'Current date' },
  { name: 'DVal', minArgs: 2, maxArgs: 2, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'String to date' },
  { name: 'DStr', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.Date, description: 'Date to string' },
  { name: 'Day', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Day of month' },
  { name: 'Month', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Month number' },
  { name: 'Year', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Year' },
  { name: 'DOW', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Day of week' },
  { name: 'DOY', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Day of year' },
  { name: 'BOY', minArgs: 1, maxArgs: 1, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'Beginning of year' },
  { name: 'BOM', minArgs: 1, maxArgs: 1, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'Beginning of month' },
  { name: 'EOY', minArgs: 1, maxArgs: 1, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'End of year' },
  { name: 'EOM', minArgs: 1, maxArgs: 1, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'End of month' },
  { name: 'AddDate', minArgs: 5, maxArgs: 5, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'Add years/months/days' },
  { name: 'DateDiff', minArgs: 3, maxArgs: 3, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Difference between dates' },
  { name: 'NDow', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.Date, description: 'Name of day' },
  { name: 'NMonth', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.Date, description: 'Name of month' },
  { name: 'DateToNum', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Date to number' },
  { name: 'NumToDate', minArgs: 1, maxArgs: 1, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'Number to date' },
  { name: 'CDOW', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Date, description: 'Character day of week (full name)' },
  { name: 'NDOW', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Numeric day of week (1=Sunday)' },
  { name: 'CMonth', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Date, description: 'Character month name' },
  { name: 'MDate', minArgs: 3, maxArgs: 3, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'Create date from Y/M/D' },
  { name: 'AddDateTime', minArgs: 3, maxArgs: 3, returnType: ParamType.Date, category: FunctionCategory.Date, description: 'Add date and time' },
  { name: 'DifDateTime', minArgs: 3, maxArgs: 3, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Difference between datetimes' },
  { name: 'Week', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Date, description: 'Week number of year' },

  // ===== Time Functions =====
  { name: 'Time', minArgs: 0, maxArgs: 0, returnType: ParamType.Time, category: FunctionCategory.Time, description: 'Current time' },
  { name: 'TVal', minArgs: 2, maxArgs: 2, returnType: ParamType.Time, category: FunctionCategory.Time, description: 'String to time' },
  { name: 'TStr', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.Time, description: 'Time to string' },
  { name: 'Hour', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Time, description: 'Hour' },
  { name: 'Minute', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Time, description: 'Minute' },
  { name: 'Second', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Time, description: 'Second' },
  { name: 'MilliSecond', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Time, description: 'Millisecond' },
  { name: 'AddTime', minArgs: 5, maxArgs: 5, returnType: ParamType.Time, category: FunctionCategory.Time, description: 'Add time components' },
  { name: 'MTime', minArgs: 0, maxArgs: 0, returnType: ParamType.Time, category: FunctionCategory.Time, description: 'Time with milliseconds' },
  { name: 'TimeToNum', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Time, description: 'Time to number' },
  { name: 'NumToTime', minArgs: 1, maxArgs: 1, returnType: ParamType.Time, category: FunctionCategory.Time, description: 'Number to time' },
  { name: 'Timer', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Time, description: 'Elapsed seconds since midnight' },

  // ===== Logical/Flow Functions =====
  { name: 'IF', minArgs: 3, maxArgs: 3, returnType: ParamType.Any, category: FunctionCategory.Flow, description: 'Conditional IF-THEN-ELSE' },
  { name: 'IIF', minArgs: 3, maxArgs: 3, returnType: ParamType.Any, category: FunctionCategory.Flow, description: 'Inline IF' },
  { name: 'CASE', minArgs: 4, maxArgs: -1, returnType: ParamType.Any, category: FunctionCategory.Flow, description: 'CASE selection' },
  { name: 'Choose', minArgs: 2, maxArgs: -1, returnType: ParamType.Any, category: FunctionCategory.Flow, description: 'Choose by index' },
  { name: 'NullIf', minArgs: 2, maxArgs: 2, returnType: ParamType.Any, category: FunctionCategory.Flow, description: 'Return null if equal' },
  { name: 'IsNull', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Flow, description: 'Check if null' },
  { name: 'IsDefault', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Flow, description: 'Check if default value' },
  { name: 'Range', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.Flow, description: 'Check if value in range' },
  { name: 'NullVal', minArgs: 2, maxArgs: 2, returnType: ParamType.Any, category: FunctionCategory.Flow, description: 'Return default if null' },
  { name: 'IN', minArgs: 2, maxArgs: -1, returnType: ParamType.Logical, category: FunctionCategory.Flow, description: 'Check if value in list' },
  { name: 'ExpCalc', minArgs: 1, maxArgs: 1, returnType: ParamType.Any, category: FunctionCategory.Flow, description: 'Evaluate expression by number' },

  // ===== Conversion Functions =====
  { name: 'Val', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Conversion, description: 'String to number' },
  { name: 'Str', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.Conversion, description: 'Number to string' },
  { name: 'Fix', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.Conversion, description: 'Format number to string' },
  { name: 'CndRange', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.Conversion, description: 'Conditional range value' },
  { name: 'Flip', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Conversion, description: 'Reverse string' },
  { name: 'Hex', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Conversion, description: 'Number to hex string' },
  { name: 'HVal', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Conversion, description: 'Hex string to number' },

  // ===== Database Functions =====
  { name: 'DbName', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Database, description: 'Get physical table name' },
  { name: 'DbDel', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Delete from table' },
  { name: 'DbExist', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Check if table exists' },
  { name: 'DbSize', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Database, description: 'Get table row count' },
  { name: 'DbRecs', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Database, description: 'Record count' },
  { name: 'Counter', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Database, description: 'Record counter' },
  { name: 'DbViewRefresh', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Refresh data view' },
  { name: 'DbPos', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Database, description: 'Get current record position' },
  { name: 'DbNext', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Move to next record' },
  { name: 'DbPrev', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Move to previous record' },
  { name: 'FlwLstRec', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Check if last record' },
  { name: 'FlwFstRec', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Check if first record' },
  { name: 'SortAdd', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Add sort condition' },
  { name: 'LocateReset', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Reset locate conditions' },
  { name: 'RangeReset', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Reset range conditions' },
  { name: 'SortReset', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Reset sort conditions' },

  // ===== System Functions =====
  { name: 'Idle', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Idle time' },
  { name: 'Delay', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'Pause execution' },
  { name: 'OSEnv', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.System, description: 'Get environment variable' },
  { name: 'Term', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.System, description: 'Terminal name' },
  { name: 'User', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.System, description: 'Current user' },
  { name: 'Rights', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'User rights' },
  { name: 'Sys', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'System information' },
  { name: 'ClientOSEnvGet', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.System, description: 'Get client environment' },
  { name: 'ClientOSEnvSet', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'Set client environment' },
  { name: 'RunMode', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Execution mode' },
  { name: 'IsComponent', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'Check if component' },
  { name: 'Sleep', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'Sleep for milliseconds' },
  { name: 'Wait', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'Wait for condition' },
  { name: 'Exit', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'Exit current task' },
  { name: 'ErrMagic', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Last Magic error code' },
  { name: 'ErrDbms', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Last DBMS error code' },
  { name: 'GetGUID', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.System, description: 'Generate new GUID' },
  { name: 'GetHostName', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.System, description: 'Get machine hostname' },

  // ===== Variable/Parameter Functions =====
  { name: 'GetParam', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Variable, description: 'Get parameter value' },
  { name: 'SetParam', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Variable, description: 'Set parameter value' },
  { name: 'Translate', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Variable, description: 'Translate logical name' },
  { name: 'INIPut', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Variable, description: 'Write to INI' },
  { name: 'INIGet', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.Variable, description: 'Read from INI' },
  { name: 'VarCurr', minArgs: 0, maxArgs: 0, returnType: ParamType.Any, category: FunctionCategory.Variable, description: 'Current variable value' },
  { name: 'VarPrev', minArgs: 0, maxArgs: 0, returnType: ParamType.Any, category: FunctionCategory.Variable, description: 'Previous variable value' },
  { name: 'VarMod', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Variable, description: 'Variable modified' },
  { name: 'VarName', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Variable, description: 'Variable name' },
  { name: 'VarAttr', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Variable, description: 'Variable attribute' },

  // ===== Program/Task Functions =====
  { name: 'Prog', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Current program number' },
  { name: 'ProgIdx', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Get program index by name' },
  { name: 'CallProg', minArgs: 1, maxArgs: -1, returnType: ParamType.Any, category: FunctionCategory.System, description: 'Call program' },
  { name: 'Level', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Task level' },
  { name: 'Stat', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'Task status' },
  { name: 'MainLevel', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Main task level' },
  { name: 'RecSuffix', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'In record suffix' },
  { name: 'RecPrefix', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'In record prefix' },
  { name: 'TaskPrefix', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'In task prefix' },
  { name: 'TaskSuffix', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.System, description: 'In task suffix' },

  // ===== UI Functions =====
  { name: 'SetCrsr', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Set cursor type' },
  { name: 'MsgBox', minArgs: 4, maxArgs: 5, returnType: ParamType.Numeric, category: FunctionCategory.UI, description: 'Show message box' },
  { name: 'StatusBarSetText', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Set status bar text' },
  { name: 'ErrMsg', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.UI, description: 'Error message' },
  { name: 'ClrErr', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Clear error' },
  { name: 'WinHelp', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Show Windows help' },
  { name: 'WinBox', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.UI, description: 'Window box' },
  { name: 'VerifyBox', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Show verification dialog' },
  { name: 'InputBox', minArgs: 4, maxArgs: 4, returnType: ParamType.Alpha, category: FunctionCategory.UI, description: 'Show input dialog' },
  { name: 'FormStateClear', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Clear form state' },
  { name: 'CtrlGoto', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Move focus to control' },
  { name: 'CtrlRefresh', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Refresh control' },
  { name: 'ViewRefresh', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.UI, description: 'Refresh current view' },

  // ===== File/IO Functions =====
  { name: 'FileExist', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.IO, description: 'Check if file exists' },
  { name: 'FileDelete', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.IO, description: 'Delete file' },
  { name: 'FileCopy', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.IO, description: 'Copy file' },
  { name: 'FileRename', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.IO, description: 'Rename file' },
  { name: 'FileSize', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.IO, description: 'Get file size' },
  { name: 'FileInfo', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.IO, description: 'Get file information' },
  { name: 'DirExist', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.IO, description: 'Check if directory exists' },
  { name: 'DirDlg', minArgs: 2, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.IO, description: 'Directory dialog' },
  { name: 'FileDlg', minArgs: 3, maxArgs: 5, returnType: ParamType.Alpha, category: FunctionCategory.IO, description: 'File dialog' },
  { name: 'File2Blb', minArgs: 1, maxArgs: 1, returnType: ParamType.Blob, category: FunctionCategory.IO, description: 'File to BLOB' },
  { name: 'Blb2File', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.IO, description: 'BLOB to file' },
  { name: 'FileListGet', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.IO, description: 'List files matching pattern' },

  // ===== BLOB Functions =====
  { name: 'BlobSize', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Blob, description: 'BLOB size' },
  { name: 'ClientFileToServer', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Blob, description: 'Upload client file' },
  { name: 'ServerFileToClient', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Blob, description: 'Download server file' },

  // ===== Error Handling =====
  { name: 'ErrPosition', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.Error, description: 'Error position' },
  { name: 'ErrDbmsCode', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Error, description: 'DBMS error code' },
  { name: 'ErrDbmsMessage', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.Error, description: 'DBMS error message' },
  { name: 'ErrMagicCode', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Error, description: 'Magic error code' },
  { name: 'LastPark', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Error, description: 'Last parked field' },
  { name: 'Rollback', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Error, description: 'Rollback transaction' },
  { name: 'Commit', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Error, description: 'Commit transaction' },

  // ===== Range/Locate Functions =====
  { name: 'RangeAdd', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Add range condition' },
  { name: 'LocateAdd', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Add locate condition' },
  { name: 'DataViewToText', minArgs: 7, maxArgs: 7, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Export view to text' },

  // ===== i18n Functions =====
  { name: 'MlsTrans', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.String, description: 'Translate text (MLS)' },

  // ===== Misc Functions =====
  { name: 'Null', minArgs: 1, maxArgs: 1, returnType: ParamType.Any, category: FunctionCategory.Conversion, description: 'Return null of type' },
  { name: 'Empty', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.Conversion, description: 'Empty string' },
  { name: 'Magic', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.System, description: 'Magic version' },
  { name: 'ClientType', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.System, description: 'Client type' },
  { name: 'CtrlName', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.UI, description: 'Current control name' },
  { name: 'EOF', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'End of file' },
  { name: 'BOF', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Beginning of file' },
  { name: 'NOT', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Logical, description: 'Logical NOT' },

  // ===== XML Functions =====
  { name: 'XMLStr', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.XML, description: 'Encode string for XML' },
  { name: 'XMLVal', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.XML, description: 'Decode XML encoded string' },
  { name: 'XMLGet', minArgs: 2, maxArgs: 2, returnType: ParamType.Alpha, category: FunctionCategory.XML, description: 'Get XML node value by XPath' },
  { name: 'XMLCnt', minArgs: 2, maxArgs: 2, returnType: ParamType.Numeric, category: FunctionCategory.XML, description: 'Count XML nodes matching XPath' },
  { name: 'XMLExist', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.XML, description: 'Check if XPath exists' },
  { name: 'XMLInsert', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.XML, description: 'Insert XML node' },
  { name: 'XMLModify', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.XML, description: 'Modify XML node value' },
  { name: 'XMLDelete', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.XML, description: 'Delete XML node' },
  { name: 'XMLValidate', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.XML, description: 'Validate XML against schema' },
  { name: 'XMLSetNS', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.XML, description: 'Set XML namespace' },

  // ===== Vector Functions =====
  { name: 'VecGet', minArgs: 2, maxArgs: 2, returnType: ParamType.Any, category: FunctionCategory.Vector, description: 'Get vector element' },
  { name: 'VecSet', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.Vector, description: 'Set vector element' },
  { name: 'VecSize', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Vector, description: 'Get vector size' },
  { name: 'VecCellAttr', minArgs: 3, maxArgs: 3, returnType: ParamType.Any, category: FunctionCategory.Vector, description: 'Get/set vector cell attribute' },

  // ===== Buffer Functions =====
  { name: 'BufGetAlpha', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.Buffer, description: 'Get string from buffer' },
  { name: 'BufSetAlpha', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Set string in buffer' },
  { name: 'BufGetNum', minArgs: 3, maxArgs: 3, returnType: ParamType.Numeric, category: FunctionCategory.Buffer, description: 'Get number from buffer' },
  { name: 'BufSetNum', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Set number in buffer' },
  { name: 'BufGetDate', minArgs: 3, maxArgs: 3, returnType: ParamType.Date, category: FunctionCategory.Buffer, description: 'Get date from buffer' },
  { name: 'BufSetDate', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Set date in buffer' },
  { name: 'BufGetTime', minArgs: 3, maxArgs: 3, returnType: ParamType.Time, category: FunctionCategory.Buffer, description: 'Get time from buffer' },
  { name: 'BufSetTime', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Set time in buffer' },
  { name: 'BufGetLog', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Get boolean from buffer' },
  { name: 'BufSetLog', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Set boolean in buffer' },
  { name: 'BufGetBlob', minArgs: 3, maxArgs: 3, returnType: ParamType.Blob, category: FunctionCategory.Buffer, description: 'Get BLOB from buffer' },
  { name: 'BufSetBlob', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Set BLOB in buffer' },
  { name: 'BufGetUnicode', minArgs: 3, maxArgs: 3, returnType: ParamType.Unicode, category: FunctionCategory.Buffer, description: 'Get unicode string from buffer' },
  { name: 'BufSetUnicode', minArgs: 4, maxArgs: 4, returnType: ParamType.Logical, category: FunctionCategory.Buffer, description: 'Set unicode string in buffer' },

  // ===== DataView Export Functions =====
  { name: 'DataViewToXML', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Export data view to XML' },
  { name: 'DataViewToHTML', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.Database, description: 'Export data view to HTML' },

  // ===== DLL Functions =====
  { name: 'CallDLL', minArgs: 2, maxArgs: -1, returnType: ParamType.Any, category: FunctionCategory.DLL, description: 'Call DLL function' },
  { name: 'CallDLLF', minArgs: 2, maxArgs: -1, returnType: ParamType.Any, category: FunctionCategory.DLL, description: 'Call DLL function (flat)' },
  { name: 'CallDLLS', minArgs: 2, maxArgs: -1, returnType: ParamType.Any, category: FunctionCategory.DLL, description: 'Call DLL function (stdcall)' },

  // ===== HTTP Functions =====
  { name: 'CallURL', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.HTTP, description: 'Call HTTP URL' },
  { name: 'CallProgURL', minArgs: 3, maxArgs: -1, returnType: ParamType.Logical, category: FunctionCategory.HTTP, description: 'Call program via HTTP' },

  // ===== COM Functions =====
  { name: 'COMObjCreate', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.COM, description: 'Create COM object' },
  { name: 'COMObjRelease', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.COM, description: 'Release COM object' },
  { name: 'COMHandleGet', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.COM, description: 'Get COM handle' },
  { name: 'COMHandleSet', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.COM, description: 'Set COM handle' },
  { name: 'COMError', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.COM, description: 'Get last COM error' },

  // ===== Mail Functions =====
  { name: 'MailSend', minArgs: 5, maxArgs: 5, returnType: ParamType.Logical, category: FunctionCategory.Mail, description: 'Send email' },

  // ===== Security Functions =====
  { name: 'Cipher', minArgs: 3, maxArgs: 3, returnType: ParamType.Alpha, category: FunctionCategory.Security, description: 'Encrypt/decrypt string' },
  { name: 'ClientCertificateAdd', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Security, description: 'Add client certificate' },
  { name: 'ClientCertificateDiscard', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Security, description: 'Discard client certificates' },

  // ===== Clipboard Functions =====
  { name: 'ClipAdd', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Clipboard, description: 'Add text to clipboard' },
  { name: 'ClipRead', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.Clipboard, description: 'Read text from clipboard' },
  { name: 'ClipWrite', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Clipboard, description: 'Write text to clipboard' },

  // ===== Context Functions =====
  { name: 'CtxGetId', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Context, description: 'Get current context ID' },
  { name: 'CtxGetName', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.Context, description: 'Get current context name' },
  { name: 'CtxSetName', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Context, description: 'Set context name' },
  { name: 'CtxNum', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Context, description: 'Get number of contexts' },
  { name: 'CtxClose', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Context, description: 'Close context' },
  { name: 'CtxKill', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Context, description: 'Kill context' },
  { name: 'CtxStat', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Context, description: 'Get context status' },
  { name: 'CtxProg', minArgs: 1, maxArgs: 1, returnType: ParamType.Alpha, category: FunctionCategory.Context, description: 'Get context program name' },
  { name: 'CtxSize', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Context, description: 'Get context size' },
  { name: 'CtxLstUse', minArgs: 1, maxArgs: 1, returnType: ParamType.Numeric, category: FunctionCategory.Context, description: 'Get context last use time' },
  { name: 'CtxGetAllNames', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.Context, description: 'Get all context names' },

  // ===== Window Functions =====
  { name: 'WinHWND', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Window, description: 'Get window handle' },
  { name: 'WinMaximize', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Window, description: 'Maximize window' },
  { name: 'WinMinimize', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Window, description: 'Minimize window' },
  { name: 'WinRestore', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.Window, description: 'Restore window' },

  // ===== Menu Functions =====
  { name: 'MnuAdd', minArgs: 3, maxArgs: 3, returnType: ParamType.Logical, category: FunctionCategory.Menu, description: 'Add menu item' },
  { name: 'MnuCheck', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Menu, description: 'Check/uncheck menu item' },
  { name: 'MnuEnabl', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Menu, description: 'Enable/disable menu item' },
  { name: 'MnuName', minArgs: 2, maxArgs: 2, returnType: ParamType.Logical, category: FunctionCategory.Menu, description: 'Set menu item name' },
  { name: 'MnuRemove', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Menu, description: 'Remove menu item' },
  { name: 'MnuShow', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Menu, description: 'Show menu' },

  // ===== Control Functions =====
  { name: 'CHeight', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Control, description: 'Get control height' },
  { name: 'CWidth', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Control, description: 'Get control width' },
  { name: 'CX', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Control, description: 'Get control X position' },
  { name: 'CY', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Control, description: 'Get control Y position' },
  { name: 'CurRow', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Control, description: 'Get current row in table' },
  { name: 'ClickWX', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Control, description: 'Get click X coordinate' },
  { name: 'ClickWY', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.Control, description: 'Get click Y coordinate' },

  // ===== MultiMark Functions =====
  { name: 'MMCount', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.MultiMark, description: 'Count marked records' },
  { name: 'MMCurr', minArgs: 0, maxArgs: 0, returnType: ParamType.Numeric, category: FunctionCategory.MultiMark, description: 'Get current marked record' },
  { name: 'MMClear', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.MultiMark, description: 'Clear all marks' },
  { name: 'MMStop', minArgs: 0, maxArgs: 0, returnType: ParamType.Logical, category: FunctionCategory.MultiMark, description: 'Stop multi-mark operation' },

  // ===== Locking Functions =====
  { name: 'Lock', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Locking, description: 'Acquire lock' },
  { name: 'UnLock', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.Locking, description: 'Release lock' },

  // ===== I18N Functions =====
  { name: 'SetLang', minArgs: 1, maxArgs: 1, returnType: ParamType.Logical, category: FunctionCategory.I18N, description: 'Set current language' },
  { name: 'GetLang', minArgs: 0, maxArgs: 0, returnType: ParamType.Alpha, category: FunctionCategory.I18N, description: 'Get current language' },
];

/**
 * Function registry with case-insensitive lookup
 */
class FunctionRegistry {
  private readonly functions: Map<string, MagicFunction>;

  constructor() {
    this.functions = new Map();
    for (const func of MAGIC_FUNCTIONS) {
      this.functions.set(func.name.toUpperCase(), func);
    }
  }

  /**
   * Get function by name (case-insensitive)
   */
  get(name: string): MagicFunction | undefined {
    return this.functions.get(name.toUpperCase());
  }

  /**
   * Check if function exists
   */
  has(name: string): boolean {
    return this.functions.has(name.toUpperCase());
  }

  /**
   * Get all functions
   */
  getAll(): MagicFunction[] {
    return Array.from(this.functions.values());
  }

  /**
   * Get functions by category
   */
  getByCategory(category: FunctionCategory): MagicFunction[] {
    return this.getAll().filter((f) => f.category === category);
  }

  /**
   * Validate function call arguments
   */
  validateArgs(name: string, argCount: number): { valid: boolean; error?: string } {
    const func = this.get(name);
    if (!func) {
      return { valid: true }; // Unknown functions are allowed by default
    }

    if (argCount < func.minArgs) {
      return {
        valid: false,
        error: `${name} requires at least ${func.minArgs} argument(s), got ${argCount}`,
      };
    }

    if (func.maxArgs !== -1 && argCount > func.maxArgs) {
      return {
        valid: false,
        error: `${name} accepts at most ${func.maxArgs} argument(s), got ${argCount}`,
      };
    }

    return { valid: true };
  }
}

/**
 * Global function registry instance
 */
export const functionRegistry = new FunctionRegistry();

/**
 * Get function info by name
 */
export function getFunction(name: string): MagicFunction | undefined {
  return functionRegistry.get(name);
}

/**
 * Check if function exists
 */
export function functionExists(name: string): boolean {
  return functionRegistry.has(name);
}

/**
 * Get all registered functions
 */
export function getAllFunctions(): MagicFunction[] {
  return functionRegistry.getAll();
}
