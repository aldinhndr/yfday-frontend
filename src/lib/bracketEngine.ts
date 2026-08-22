// src/libs/bracketEngine.ts
/* bracketry v1.1.3 (MIT) - Clean TypeScript Wrapper */

const t = (t: any, e: any) => {
  console.warn(`Incorrect data. %c${t}`, "padding: 0 5px; color: #b90000; background: #ffff81", e);
};

const e = (e: any) => {
  if (!e.length) return { have_errors: !1, have_critical_error: !1 };
  const n = e.find((t: any) => t.is_critical);
  return n
    ? (t(n.message, n.data || ""), { have_errors: !0, have_critical_error: !0 })
    : (t(e[0].message, e[0].data || ""), { have_errors: !0, have_critical_error: !1 });
};

const n = (t: any, e = 300) => {
  let n: any;
  return (...r: any[]) => {
    clearTimeout(n);
    n = setTimeout(() => {
      t.apply(void 0, r);
    }, e);
  };
};

const r = (t: any, e: any) => {
  let n = !0, r: any = null;
  return function o(this: any, ...args: any[]) {
    var a = this;
    n
      ? (n = !1,
        setTimeout(() => {
          n = !0;
          r && o.apply(a);
        }, e),
        r ? (t.apply(this, r), (r = null)) : t.apply(this, args))
      : (r = args);
  };
};

const s = (t: any) => {
  if ("string" != typeof t) return document.createElement("div");
  const e = document.createElement("div");
  e.innerHTML = t.trim();
  return e.firstElementChild ? e.firstElementChild : document.createElement("div");
};

const l = (t: any, e: (idx: number) => any) => Array.from(Array(t)).map((_, n: number) => e(n));

const d = (t: any, e: any, n: any) => {
  const r = document.head.querySelector(`#${t}-${e}`);
  r && document.head.removeChild(r);
  document.head.insertAdjacentHTML("beforeend", `<style id='${t}-${e}'>${n}</style>`);
};

const u = (t: any): any => {
  if (null === t || "object" != typeof t) return t;
  let e = new (t as any).constructor();
  for (let n in t) t.hasOwnProperty(n) && (e[n] = u(t[n]));
  return e;
};

const h = ".bracket-root {}\n.bracket-root .navigation-button,.bracket-root .scroll-button {justify-content: center;align-items: center;cursor: auto;user-select: none;z-index: 3;}\n.bracket-root .navigation-button.active,.bracket-root .scroll-button.active {cursor: pointer;}\n.bracket-root .navigation-button.active > *,.bracket-root .scroll-button.active > * {opacity: 1;}\n.bracket-root .navigation-button > *,.bracket-root .scroll-button > * {opacity: 0.15;}\n.bracket-root .navigation-button {display: grid;}\n.bracket-root .navigation-button.left {grid-column: 1;}\n.bracket-root .navigation-button.right {grid-column: 5;}\n.bracket-root .navigation-button.hidden {display: none;}\n.bracket-root .scroll-button {grid-column: 2/span 2;display: none;}";
const v = ".bracket-root {display: grid;grid-template-columns: auto 1fr 1fr 0 auto;grid-template-rows: auto auto auto 1fr auto;min-width: 260px;min-height: 250px;max-width: 100%;width: var(--width);height: var(--height);text-align: left;box-sizing: border-box;font-family: var(--rootFontFamily);background-color: var(--rootBgColor);}\n.bracket-root * {box-sizing: border-box;user-select: none;margin: 0;padding: 0;}\n.bracket-root .equal-width-columns-grid {display: grid;grid-auto-flow: column;grid-auto-columns: minmax(0, 1fr);}\n.bracket-root .round-titles-grid-item {width: 0;min-width: 100%;grid-row: 2;grid-column: 2/span 2;overflow: hidden;padding-bottom: 1px;border-bottom: 1px solid var(--roundTitlesBorderColor, var(--rootBorderColor));}\n.bracket-root .round-titles-wrapper {height: 100%;min-width: 100%;font-size: var(--roundTitlesFontSize);font-family: var(--roundTitlesFontFamily, var(--rootFontFamily));color: var(--roundTitleColor);}\n.bracket-root .round-title {padding: var(--roundTitlesVerticalPadding) var(--matchHorMargin);display: flex;overflow: hidden;justify-content: center;white-space: nowrap;}\n.bracket-root .matches-scroller {grid-column: 2/span 2;grid-row: 4;overflow: hidden;}\n.bracket-root .matches-positioner {position: relative;z-index: 2;display: grid;min-width: 100%;min-height: 100%;grid-template-rows: 100%;overflow: hidden;padding: var(--mainVerticalPadding, 0) 0;font-size: var(--matchFontSize);}\n.bracket-root .scrollbar-parent {display: none;}";
const m = ".bracket-root .round-wrapper {position: relative;display: grid;grid-auto-rows: minmax(0, 1fr);align-items: stretch;min-width: 180px;max-width: 100%;}\n.bracket-root .round-wrapper:first-of-type .match-lines-area {left: var(--matchHorMargin);}\n.bracket-root .round-wrapper:last-of-type .match-lines-area {right: var(--matchHorMargin);}\n.bracket-root .match-wrapper {display: flex;align-items: center;justify-content: center;width: 100%;position: relative;min-height: 40px;box-sizing: border-box;padding: calc(var(--matchMinVerticalGap) / 2) var(--matchHorMargin);}\n.bracket-root .match-wrapper.odd .line-wrapper.upper {box-shadow: var(--connectionLinesWidth) 0px 0px 0px;border-bottom: var(--connectionLinesWidth) solid var(--connectionLinesColor);}\n.bracket-root .match-wrapper.even .line-wrapper.lower {box-shadow: var(--connectionLinesWidth) 0px 0px 0px;border-top: var(--connectionLinesWidth) solid var(--connectionLinesColor);}\n.bracket-root .match-body {display: flex;width: 100%;max-width: var(--matchMaxWidth);justify-content: center;z-index: 2;border-width: var(--connectionLinesWidth, 2);border-style: solid;border-color: transparent;position: relative;}\n.bracket-root .match-body .sides {flex: 1;display: grid;grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);grid-template-columns: minmax(0, 1fr);grid-row-gap: var(--connectionLinesWidth);}\n.bracket-root .match-lines-area {position: absolute;left: 0;right: 0;top: 0;bottom: 0;display: flex;flex-direction: column;pointer-events: none;z-index: 1;}\n.bracket-root .match-lines-area .line-wrapper {flex: 1;color: var(--connectionLinesColor);}\n.bracket-root .matches-positioner > .round-wrapper:last-of-type .line-wrapper {color: transparent;}\n.bracket-root .side-wrapper {width: 100%;display: flex;align-items: center;padding: var(--matchAxisMargin) calc(var(--matchFontSize) / 2);color: var(--matchTextColor);}\n.bracket-root .player-wrapper {display: flex;align-items: center;min-width: 0;overflow: hidden;}\n.bracket-root .player-wrapper .player-title {flex: 1;text-align: left;text-overflow: ellipsis;min-width: 0;overflow: hidden;padding-right: calc(var(--matchFontSize) * 1.5);font-family: var(--playerTitleFontFamily, var(--rootFontFamily));}";

const f = { type: "function_or_null", default_value: null };
const y: any = {
  GENERAL_OPTIONS: {
    width: { type: "string", default_value: "max-content" },
    height: { type: "string", default_value: "100%" },
    rootBgColor: { type: "string", default_value: "transparent" },
    mainVerticalPadding: { type: "pixels", default_value: 20, min_value: 0 },
    visibleRoundsCount: { type: "number", default_value: 0 },
    displayWholeRounds: { type: "boolean", default_value: !1 },
    useClassicalLayout: { type: "boolean", default_value: !1 },
    disableHighlight: { type: "boolean", default_value: !1 }
  },
  BORDERS_OPTIONS: {
    rootBorderColor: { type: "string", default_value: "#bbbbbb" },
    wrapperBorderColor: { type: "string", default_value: "" },
    roundTitlesBorderColor: { type: "string", default_value: "" },
    scrollGutterBorderColor: { type: "string", default_value: "" },
    navGutterBorderColor: { type: "string", default_value: "" },
    liveMatchBorderColor: { type: "string", default_value: "#44c985" },
    hoveredMatchBorderColor: { type: "string", default_value: "" }
  },
  ROUND_TITLE_OPTIONS: {
    getRoundTitleElement: f,
    roundTitlesVerticalPadding: { type: "pixels", default_value: 8 },
    roundTitleColor: { type: "string", default_value: "#000" }
  },
  NAVIGATION_OPTIONS: {
    navButtonsPosition: { type: "select", options: ["overMatches", "gutters", "beforeTitles", "overTitles", "hidden"], default_value: "hidden" }
  },
  FONTS_OPTIONS: {
    rootFontFamily: { type: "string", default_value: "Sora, sans-serif" },
    roundTitlesFontFamily: { type: "string", default_value: "'JetBrains Mono', monospace" },
    roundTitlesFontSize: { type: "pixels", default_value: 11, min_value: 8 },
    matchTextColor: { type: "string", default_value: "#EDE9FE" },
    matchFontSize: { type: "pixels", default_value: 13, min_value: 8 },
    playerTitleFontFamily: { type: "string", default_value: "'Sora', sans-serif" }
  },
  CONNECTION_LINES_OPTIONS: {
    connectionLinesWidth: { type: "pixels", default_value: 2, min_value: 0 },
    connectionLinesColor: { type: "string", default_value: "rgba(167,139,250,0.5)" }
  },
  MATCH_OPTIONS: {
    matchMaxWidth: { type: "pixels", default_value: 1e3 },
    matchMinVerticalGap: { type: "pixels", default_value: 14 },
    matchHorMargin: { type: "pixels", default_value: 8 },
    matchAxisMargin: { type: "pixels", default_value: 4 }
  }
};

const w = () => {
  const t: any = {};
  Object.values(y).forEach((e: any) => Object.assign(t, e));
  return t;
};

const k = (t: any, e: any, { the_root_element: n }: any) => {
  const o = w();
  const a = e.get_all_final_options();
  Object.entries(a).forEach(([prop, val]: [string, any]) => {
    const { type: r } = o[prop] || {};
    if (["pixels", "string"].includes(r)) {
      let oVal = val;
      "pixels" === r && (oVal = parseInt(oVal) + "px");
      n.style.setProperty(`--${prop}`, oVal);
    }
  });
};

const L = (t: any, e: any, n: any) => {
  const r = n[t];
  if (void 0 === r) return;
  const o = e[t];
  return void 0 !== o ? o : r.default_value;
};

const B = (t: any, e: any, n: any) => {
  n.matches_positioner.style.width = "100%";
  n.round_titles_wrapper.style.width = "100%";
};

const E = (t: any, e: any) => {
  const a = { set: () => {}, try_decrement: () => {}, try_increment: () => {}, get: () => 0 };
  const i = () => B(a, e, t);
  i();
  return {
    move_left: () => {},
    move_right: () => {},
    set_base_round_index: () => {},
    repaint: i,
    handle_click: () => {},
    get_state: () => ({}),
    uninstall: () => {}
  };
};

const $ = (t: any, e: any) => `<div class="player-wrapper"><div class="player-title">${e}</div></div>`;

const F = (t: any, e: any) => {
  const o = t.sides?.[e];
  let v = "";
  if (o && typeof o === "object" && Object.keys(o).length > 0) {
    v = $("", o.title || "BYE");
  } else {
    v = $("", "—");
  }
  return `<div class="side-wrapper"><div class="side-info-item players-info">${v}</div></div>`;
};

const P = (t: any, e: any, n: any) => {
  const i = s('<div class="match-body"></div>');
  if (void 0 === t) return null;
  Array.isArray(t.sides) && (i.innerHTML += `<div class="sides">${F(t, 0)}${F(t, 1)}</div>`);
  return i;
};

const j = (t: any, e: any, n: any) => {
  const o = n.matches?.find((m: any) => m.roundIndex === t && m.order === e);
  let a = e % 2 === 0;
  const i = s(`<div class="match-wrapper ${a ? "even" : "odd"}" match-order="${e}"><div class="match-lines-area"><div class="line-wrapper upper"></div><div class="line-wrapper lower"></div></div></div>`);
  i.prepend(P(o, n, t) || "");
  return i;
};

const N = (t: any, e: any) =>
  t.rounds.slice(0, e).map((rItem: any) => {
    const o = document.createElement("div");
    o.className = "round-title";
    o.innerHTML = rItem.name || "Round";
    return o;
  });

const R = (t: any, e: any) => {
  e.round_titles_wrapper.innerHTML = "";
  e.matches_positioner.innerHTML = "";
  const rCount = t.rounds.length;
  e.round_titles_wrapper.append(...N(t, rCount));
  const o: any[] = [];
  t.rounds.forEach((_: any, rIdx: number) => {
    const a = ((roundData: any, rIndex: number) => {
      const wrapper = s('<div class="round-wrapper"></div>');
      wrapper.setAttribute("round-index", String(rIndex));
      const lastR = roundData.rounds.length - 1;
      const matchCount = Math.pow(2, lastR - rIndex);
      const matches = l(matchCount, (orderIdx: number) => j(rIndex, orderIdx, roundData));
      wrapper.append(...matches);
      return wrapper;
    })(t, rIdx);
    o.push(a);
  });
  e.matches_positioner.append(...o);
};

const nt = (t: any, n: any) => {
  Object.keys(t).forEach((eKey: string) => delete t[eKey]);
  Object.assign(t, u(n));
  return !0;
};

const rt = (t: any, n: any, o: any) => {
  let c = (() => {
    let tObj: any = {};
    const eObj = w();
    return {
      try_merge_options: (nOpt: any) => {
        Object.assign(tObj, nOpt);
      },
      get_final_value: (nKey: any) => L(nKey, tObj, eObj),
      get_user_options: () => tObj,
      get_all_final_options: () => {
        const nRes: any = {};
        Object.keys(eObj).forEach((rKey: string) => {
          nRes[rKey] = L(rKey, tObj, eObj);
        });
        return nRes;
      }
    };
  })();

  let fObj: any = {};
  if (!(n && n instanceof Element)) return;

  d("root", "permanent-styles", [h, v, m].join("\n"));
  const eEl = s('<div class="bracket-root"><div class="round-titles-grid-item"><div class="round-titles-wrapper equal-width-columns-grid"></div></div><div class="matches-scroller"><div class="matches-positioner equal-width-columns-grid"></div></div></div>');
  n.append(eEl);

  let rootRef = {
    the_root_element: eEl,
    round_titles_wrapper: eEl.querySelector(".round-titles-wrapper"),
    matches_scroller: eEl.querySelector(".matches-scroller"),
    matches_positioner: eEl.querySelector(".matches-positioner")
  };

  k(o, c, rootRef);
  nt(fObj, t);
  R(fObj, rootRef);
  let M = E(rootRef, c.get_final_value);

  return {
    replaceData: (tNew: any) => {
      nt(fObj, tNew);
      R(fObj, rootRef);
      M.repaint();
    },
    uninstall: () => {
      eEl.remove();
    }
  };
};

export const createBracket = rt;

export const BRACKET_OPTIONS = {
  connectionLinesWidth: 2,
  connectionLinesColor: "rgba(167,139,250,0.5)",
  rootBgColor: "transparent",
  rootBorderColor: "rgba(167,139,250,0.18)",
  matchTextColor: "#EDE9FE",
  matchFontSize: 13,
  roundTitleColor: "#38BDF8",
  roundTitlesFontFamily: "'JetBrains Mono', monospace",
  roundTitlesFontSize: 11,
  playerTitleFontFamily: "'Sora', sans-serif",
  mainVerticalPadding: 20,
  matchMinVerticalGap: 14,
  matchHorMargin: 8
};

export function nextPow2(num: number): number {
  let p = 1;
  while (p < num) p *= 2;
  return Math.max(p, 2);
}

export function roundName(idx: number, total: number): string {
  const fromEnd = total - 1 - idx;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinal";
  if (fromEnd === 2) return "Perempat Final";
  const size = Math.pow(2, fromEnd + 1);
  return `Babak ${size} Besar`;
}

export function buildHalfData(filled: Record<number, { name: string }>, halfSize: number) {
  const padded = nextPow2(halfSize);
  const numRounds = Math.log2(padded);
  const rounds = Array.from({ length: numRounds }, (_, i) => ({ name: roundName(i, numRounds) }));

  const slots: (string | null)[] = [];
  for (let i = 1; i <= padded; i++) {
    if (i <= halfSize && filled[i]) slots.push(filled[i].name);
    else if (i <= halfSize) slots.push(null);
    else slots.push("BYE");
  }

  const matches = [];
  for (let matchIdx = 0; matchIdx < padded / 2; matchIdx++) {
    const a = slots[2 * matchIdx];
    const b = slots[2 * matchIdx + 1];
    matches.push({
      roundIndex: 0,
      order: matchIdx,
      sides: [a ? { title: a } : {}, b ? { title: b } : {}]
    });
  }

  for (let rIdx = 1; rIdx < numRounds; rIdx++) {
    const count = padded / Math.pow(2, rIdx + 1);
    for (let matchIdx = 0; matchIdx < count; matchIdx++) {
      matches.push({ roundIndex: rIdx, order: matchIdx, sides: [{}, {}] });
    }
  }

  return { rounds, matches };
}