import React, { useReducer, useState, useEffect, useCallback } from 'react';
import {
  portageReducer,
  createInitialState,
  STEPS,
  Step,
  PortageAction,
} from './state/portage';
import { getScenario } from './data/scenarios';
import { BRAND } from './brand';
import { syncDocumentSeo } from './seo/metadata';
import {
  initGa4,
  trackStepView,
  trackScenarioSelected,
  trackSkillsAnalyzed,
  trackSkillCurated,
  trackPracticeAttempt,
} from './analytics/ga4';
import { Navbar } from './components/Navbar';
import { Stepper } from './components/Stepper';
import { Welcome } from './components/Welcome';
import { RoleIntake } from './components/RoleIntake';
import { SkillsDashboard } from './components/SkillsDashboard';
import { NextSkillCard } from './components/NextSkillCard';
import { PracticeToProofLoop } from './components/PracticeToProofLoop';
import { PortfolioGenerator } from './components/PortfolioGenerator';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function App() {
  const [state, rawDispatch] = useReducer(portageReducer, undefined, () => {
    const initial = createInitialState();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qScenario = params.get('scenario');
      if (qScenario && getScenario(qScenario)) {
        return portageReducer(initial, {
          type: 'START_SCENARIO',
          scenarioId: qScenario,
        });
      }
    }
    return initial;
  });
  const [maxReached, setMaxReached] = useState<number>(0);

  const dispatch = useCallback(
    (action: PortageAction) => {
      rawDispatch(action);
      const nextState = portageReducer(state, action);
      switch (action.type) {
        case 'START_SCENARIO':
          trackScenarioSelected(action.scenarioId, 'preset');
          break;
        case 'START_BLANK':
          trackScenarioSelected('custom', 'blank');
          break;
        case 'ANALYZE': {
          const unmatched = nextState.mappings.filter(
            (m) => m.transferableSkill === 'Needs your input'
          ).length;
          trackSkillsAnalyzed(
            nextState.scenarioId,
            nextState.mappings.length,
            unmatched
          );
          break;
        }
        case 'ACCEPT_ALL_SUGGESTED':
          trackSkillCurated(nextState.scenarioId, 'accept_all');
          break;
        case 'SET_MAPPING_STATUS':
          trackSkillCurated(nextState.scenarioId, action.status);
          break;
        case 'SUBMIT_ATTEMPT': {
          const latest = nextState.attempts[nextState.attempts.length - 1];
          if (latest) {
            trackPracticeAttempt(
              nextState.scenarioId,
              latest.attemptNumber,
              latest.result.score,
              latest.result.criteria.length
            );
          }
          break;
        }
        default:
          break;
      }
    },
    [state]
  );

  const currentIdx = STEPS.indexOf(state.step);

  useEffect(() => {
    initGa4();
  }, []);

  useEffect(() => {
    if (currentIdx > maxReached) {
      setMaxReached(currentIdx);
    }
    syncDocumentSeo(state.step, state.scenarioId);
    trackStepView(state.step, state.scenarioId);
    const h1 = document.querySelector('main h1') as HTMLElement | null;
    if (h1) {
      h1.focus();
    }
  }, [state.step, state.scenarioId, currentIdx, maxReached]);

  // Step validity for advancing
  const canAdvance = (() => {
    switch (state.step) {
      case 'intake':
        return state.dutiesInput.trim().length > 0 || state.currentRole.trim().length > 0;
      case 'skills':
        return state.mappings.length > 0;
      case 'next':
        return true;
      case 'practice':
        return state.attempts.length > 0;
      case 'evidence':
        return false;
      default:
        return true;
    }
  })();

  const handleGoTo = (step: Step) => {
    dispatch({ type: 'GO_TO', step });
  };

  return (
    <div className="min-h-screen bg-paper text-navy flex flex-col font-sans selection:bg-river-ink/20">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-river-ink focus:shadow-md focus:rounded-md focus:ring-2 focus:ring-river-ink"
      >
        Skip to content
      </a>

      <Navbar onReset={() => dispatch({ type: 'RESET' })} />

      {state.step !== 'welcome' && (
        <Stepper
          step={state.step}
          maxReached={maxReached}
          onGoTo={handleGoTo}
        />
      )}

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 flex-1 w-full">
        {state.step === 'welcome' && <Welcome state={state} dispatch={dispatch} />}
        {state.step === 'intake' && <RoleIntake state={state} dispatch={dispatch} />}
        {state.step === 'skills' && <SkillsDashboard state={state} dispatch={dispatch} />}
        {state.step === 'next' && <NextSkillCard state={state} dispatch={dispatch} />}
        {state.step === 'practice' && <PracticeToProofLoop state={state} dispatch={dispatch} />}
        {state.step === 'evidence' && <PortfolioGenerator state={state} dispatch={dispatch} />}
      </main>

      {state.step !== 'welcome' && (
        <div className="border-t border-line bg-white/80 backdrop-blur-sm sticky bottom-0 z-30 py-4 px-4">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <button
              type="button"
              onClick={() => dispatch({ type: 'BACK' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-ink hover:text-navy hover:bg-paper rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-river-ink"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </button>

            {state.step !== 'evidence' && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'NEXT' })}
                disabled={!canAdvance}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-river-ink hover:bg-river-ink/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-river-ink"
              >
                Continue
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-line py-8 px-4 text-center text-xs text-slate-ink mt-auto">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="font-medium text-navy">{BRAND.event}</p>
          <p>
            Runs entirely in your browser. Nothing you type leaves this device, and reloading clears it.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
