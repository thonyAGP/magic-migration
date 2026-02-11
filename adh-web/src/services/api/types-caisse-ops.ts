// DTOs for caisse operations API endpoints
import type {
  ApportCoffreData,
  ApportProduitsData,
  RemiseCoffreData,
  TelecollecteData,
  TelecollecteResult,
  PointageData,
  RegularisationData,
  CaisseOperation,
} from '@/types/caisseOps';

// Apport Coffre
export interface ApportCoffreRequest extends ApportCoffreData {
  sessionId: number;
}
export interface ApportCoffreResponse {
  operationId: number;
  success: boolean;
}

// Apport Produits
export interface ApportProduitsRequest extends ApportProduitsData {
  sessionId: number;
}
export interface ApportProduitsResponse {
  operationId: number;
  success: boolean;
}

// Remise Coffre
export interface RemiseCoffreRequest extends RemiseCoffreData {
  sessionId: number;
}
export interface RemiseCoffreResponse {
  operationId: number;
  success: boolean;
}

// Telecollecte
export interface TelecollecteRequest extends TelecollecteData {
  sessionId: number;
}
export type TelecollecteResponse = TelecollecteResult;

// Pointage
export interface PointageResponse extends PointageData {
  lastUpdated: string;
}

// Regularisation
export interface RegularisationRequest extends RegularisationData {
  sessionId: number;
}
export interface RegularisationResponse {
  operationId: number;
  success: boolean;
}

// History
export type CaisseOperationResponse = CaisseOperation;
