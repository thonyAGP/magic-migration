/**
 * XML Parser - Low-level Magic Unipaas XML parsing
 * Uses fast-xml-parser to convert Magic XML to JavaScript objects
 */

import { XMLParser } from 'fast-xml-parser';
import * as fs from 'node:fs';

export interface ParsedProgram {
  Program: {
    '@_ISN'?: string;
    '@_Name'?: string;
    TasksTree?: {
      Task?: TaskXML | TaskXML[];
    };
    DataView?: DataViewXML | DataViewXML[];
    Variables?: {
      Variable?: VariableXML | VariableXML[];
    };
  };
}

export interface ParsedHeaders {
  MagicGeneral?: {
    Program?: {
      '@_ISN': string;
      '@_Name': string;
      '@_PublicName'?: string;
    }[];
  };
}

export interface TaskXML {
  '@_ISN': string;
  '@_TaskID': string;
  '@_Level': string;
  '@_Disabled'?: '0' | '1';
  Task?: TaskXML | TaskXML[];
  EventHandlers?: {
    EventHandler?: EventHandlerXML | EventHandlerXML[];
  };
  LogicLines?: {
    LogicLine?: LogicLineXML | LogicLineXML[];
  };
}

export interface EventHandlerXML {
  '@_Event': string;
  '@_Disabled'?: '0' | '1';
  LogicLines?: {
    LogicLine?: LogicLineXML | LogicLineXML[];
  };
}

export interface LogicLineXML {
  '@_ID': string;
  '@_Disabled'?: '0' | '1';
  '@_Expression'?: string;
  '@_CallTask'?: string;
  '@_CallSubForm'?: string;
}

export interface DataViewXML {
  '@_ISN': string;
  '@_TableISN': string;
  '@_Link'?: string;
  Columns?: {
    Column?: ColumnXML | ColumnXML[];
  };
}

export interface ColumnXML {
  '@_ISN': string;
  '@_FieldISN': string;
  '@_Direction'?: string;
}

export interface VariableXML {
  '@_ID': string;
  '@_Name'?: string;
  '@_Type': string;
  '@_Scope'?: string;
}

/**
 * Parse Magic program XML file
 */
export const parseProgramXML = (xmlPath: string): ParsedProgram => {
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    trimValues: true,
  });

  const parsed = parser.parse(xmlContent);
  return parsed as ParsedProgram;
};

/**
 * Parse ProgramHeaders.xml file
 */
export const parseProgramHeaders = (xmlPath: string): ParsedHeaders => {
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    isArray: (tagName) => tagName === 'Program',
  });

  const parsed = parser.parse(xmlContent);
  return parsed as ParsedHeaders;
};

/**
 * Normalize single item or array to array
 */
export const toArray = <T>(item: T | T[] | undefined): T[] => {
  if (item === undefined) return [];
  return Array.isArray(item) ? item : [item];
};

/**
 * Check if element is disabled
 */
export const isDisabled = (element: { '@_Disabled'?: '0' | '1' }): boolean => {
  return element['@_Disabled'] === '1';
};
