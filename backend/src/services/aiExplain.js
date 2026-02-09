async function explainTrade(trade) {
  return {
    title: 'Trade explanation',
    text:
      'This trade adheres to the Fibonacci pullback strategy on H4 with strict risk management. No profit guarantees; educational transparency only.',
  };
}

async function explainDrawdown(snapshotSeries) {
  return {
    title: 'Drawdown explanation',
    text:
      'Drawdown reflects equity decline from peak. Strategy continues deterministically, respecting max drawdown protection.',
  };
}

module.exports = { explainTrade, explainDrawdown };

