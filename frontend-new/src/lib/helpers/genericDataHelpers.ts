/**
 * Helper functions for looking up names from generic data
 */

interface State {
  id: number;
  state: string;
}

interface Prison {
  id: number;
  prison_name: string;
}

interface StateLike {
  id?: number;
  state?: string;
  name?: string;
}

interface PrisonLike {
  id?: number;
  prison_name?: string;
  name?: string;
}

/**
 * Get state name by ID
 * @param stateValue - State ID, state name, or state object
 * @param states - Array of states
 * @returns State name or the original value if not found, or undefined if no value provided
 */
export function getStateName(
  stateValue?: string | number | StateLike | null,
  states?: State[] | null,
): string | undefined {
  if (!stateValue) return undefined;

  if (typeof stateValue === "object") {
    if ("state" in stateValue && typeof stateValue.state === "string") {
      return stateValue.state;
    }
    if ("name" in stateValue && typeof stateValue.name === "string") {
      return stateValue.name;
    }
    if (
      "id" in stateValue &&
      (typeof stateValue.id === "number" || typeof stateValue.id === "string")
    ) {
      return getStateName(stateValue.id, states);
    }
    return undefined;
  }

  if (!states) return stateValue.toString();

  // Check if the value is numeric (ID)
  const stateValueStr = stateValue.toString();
  if (/^\d+$/.test(stateValueStr)) {
    const state = states.find((s) => s.id === Number(stateValueStr));
    return state?.state;
  }

  // Otherwise, it's already a state name
  return stateValueStr;
}

/**
 * Get state ID by value
 * @param stateValue - State ID, state name, or state object
 * @param states - Array of states for name -> id lookup
 * @returns State ID as string or undefined if no value provided
 */
export function getStateId(
  stateValue?: string | number | StateLike | null,
  states?: State[] | null,
): string | undefined {
  if (!stateValue) return undefined;

  if (typeof stateValue === "object") {
    if (
      "id" in stateValue &&
      (typeof stateValue.id === "number" || typeof stateValue.id === "string")
    ) {
      return stateValue.id.toString();
    }
    if ("state" in stateValue && typeof stateValue.state === "string" && states) {
      const match = states.find((state) => state.state === stateValue.state);
      return match?.id?.toString();
    }
    if ("name" in stateValue && typeof stateValue.name === "string" && states) {
      const match = states.find((state) => state.state === stateValue.name);
      return match?.id?.toString();
    }
    return undefined;
  }

  const stateValueStr = stateValue.toString();
  if (/^\d+$/.test(stateValueStr)) return stateValueStr;

  if (states) {
    const match = states.find((state) => state.state === stateValueStr);
    return match?.id?.toString();
  }

  return undefined;
}

/**
 * Get prison/custodial center name by ID
 * @param prisonValue - Prison ID, prison name, or prison object
 * @param prisons - Array of prisons
 * @returns Prison name or the original value if not found, or undefined if no value provided
 */
export function getPrisonName(
  prisonValue?: string | number | PrisonLike | null,
  prisons?: Prison[] | null,
): string | undefined {
  if (!prisonValue) return undefined;

  if (typeof prisonValue === "object") {
    if (
      "prison_name" in prisonValue &&
      typeof prisonValue.prison_name === "string"
    ) {
      return prisonValue.prison_name;
    }
    if ("name" in prisonValue && typeof prisonValue.name === "string") {
      return prisonValue.name;
    }
    if (
      "id" in prisonValue &&
      (typeof prisonValue.id === "number" || typeof prisonValue.id === "string")
    ) {
      return getPrisonName(prisonValue.id, prisons);
    }
    return undefined;
  }

  if (!prisons) return prisonValue.toString();

  // Check if the value is numeric (ID)
  const prisonValueStr = prisonValue.toString();
  if (/^\d+$/.test(prisonValueStr)) {
    const prison = prisons.find((p) => p.id === Number(prisonValueStr));
    return prison?.prison_name;
  }

  // Otherwise, it's already a prison name
  return prisonValueStr;
}
