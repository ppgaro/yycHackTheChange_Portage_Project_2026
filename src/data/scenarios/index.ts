import { Scenario } from '../../types/domain';
import { rigtorack } from './rigtorack';
import { hospitalityBi } from './hospitality-bi';
import { retailPm } from './retail-pm';
import { adminUxr } from './admin-uxr';

export { rigtorack, hospitalityBi, retailPm, adminUxr };

export const SCENARIOS: Scenario[] = [
  rigtorack,
  hospitalityBi,
  retailPm,
  adminUxr,
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
