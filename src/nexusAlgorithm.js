// nexusAlgorithm.js - NEXUS Trading Algorithm Implementation

class NEXUSAlgorithm {
  constructor() {
    this.name = "NEXUS Algorithm™";
    this.version = "1.0.0";
  }

  // Calculate Simple Moving Average
  calculateSMA(data, period) {
    const smas = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        smas.push(null);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        smas.push(sum / period);
      }
    }
    return smas;
  }

  // Calculate Exponential Moving Average
  calculateEMA(data, period) {
    const emas = [];
    const multiplier = 2 / (period + 1);
    let sma = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    emas.push(null);

    for (let i = period; i < data.length; i++) {
      sma = (data[i] - sma) * multiplier + sma;
      emas.push(sma);
    }
    return emas;
  }

  // Calculate RSI (Relative Strength Index)
  calculateRSI(data, period = 14) {
    const rsis = [];
    const gains = [];
    const losses = [];

    for (let i = 1; i < data.length; i++) {
      const diff = data[i] - data[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? Math.abs(diff) : 0);
    }

    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        rsis.push(null);
      } else {
        const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsis.push(rsi);
      }
    }
    return rsis;
  }

  // Calculate MACD
  calculateMACD(data, fast = 12, slow = 26, signal = 9) {
    const ema12 = this.calculateEMA(data, fast);
    const ema26 = this.calculateEMA(data, slow);
    const macdLine = [];
    const signalLine = [];
    const histogram = [];

    // MACD Line = EMA12 - EMA26
    for (let i = 0; i < data.length; i++) {
      if (ema12[i] && ema26[i]) {
        macdLine.push(ema12[i] - ema26[i]);
      } else {
        macdLine.push(null);
      }
    }

    // Signal Line = EMA of MACD
    const validMACD = macdLine.filter(m => m !== null);
    if (validMACD.length > 0) {
      const signalEMA = this.calculateEMA(validMACD, signal);
      let signalIndex = 0;
      for (let i = 0; i < macdLine.length; i++) {
        if (macdLine[i] !== null) {
          signalLine.push(signalEMA[signalIndex] || null);
          signalIndex++;
        } else {
          signalLine.push(null);
        }
      }
    }

    // Histogram = MACD - Signal
    for (let i = 0; i < macdLine.length; i++) {
      if (macdLine[i] && signalLine[i]) {
        histogram.push(macdLine[i] - signalLine[i]);
      } else {
        histogram.push(null);
      }
    }

    return { macdLine, signalLine, histogram };
  }

  // Calculate ATR (Average True Range) - Volatility
  calculateATR(highs, lows, closes, period = 14) {
    const trues = [];
    const atrs = [];

    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trues.push(tr);
    }

    let atr = trues.slice(0, period).reduce((a, b) => a + b, 0) / period;
    atrs.push(null);

    for (let i = period; i < trues.length; i++) {
      atr = (trues[i] - atr) * (2 / (period + 1)) + atr;
      atrs.push(atr);
    }

    return atrs;
  }

  // Detect Trend Direction
  detectTrend(closes, ema200Index) {
    const lastClose = closes[closes.length - 1];
    const ema200 = ema200Index[ema200Index.length - 1];

    if (!ema200) return "NEUTRAL";

    if (lastClose > ema200) return "BULLISH";
    if (lastClose < ema200) return "BEARISH";
    return "NEUTRAL";
  }

  // Detect RSI Divergence
  detectRSIDivergence(closes, rsis, lookback = 20) {
    const recentData = closes.slice(-lookback);
    const recentRSI = rsis.slice(-lookback);

    let priceHigh = Math.max(...recentData);
    let priceHighIndex = recentData.indexOf(priceHigh);
    let rsiAtPriceHigh = recentRSI[priceHighIndex];

    let priceLow = Math.min(...recentData);
    let priceLowIndex = recentData.indexOf(priceLow);
    let rsiAtPriceLow = recentRSI[priceLowIndex];

    // Bearish Divergence: Price higher, RSI lower
    if (priceHighIndex > priceLowIndex && rsiAtPriceHigh < rsiAtPriceLow) {
      return "BEARISH_DIVERGENCE";
    }

    // Bullish Divergence: Price lower, RSI higher
    if (priceLowIndex > priceHighIndex && rsiAtPriceLow > rsiAtPriceHigh) {
      return "BULLISH_DIVERGENCE";
    }

    return "NO_DIVERGENCE";
  }

  // Detect Volume Spike
  detectVolumeSpike(volumes, threshold = 1.2) {
    const avg20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[volumes.length - 1];
    const ratio = currentVolume / avg20;

    return {
      spike: ratio > threshold,
      ratio: ratio.toFixed(2),
      isExtreme: ratio > 1.5
    };
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(closes, period = 20, stdDev = 2) {
    const sma = this.calculateSMA(closes, period);
    const bands = [];

    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1 || !sma[i]) {
        bands.push(null);
        continue;
      }

      const subset = closes.slice(i - period + 1, i + 1);
      const mean = subset.reduce((a, b) => a + b, 0) / period;
      const variance = subset.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const std = Math.sqrt(variance);

      bands.push({
        upper: sma[i] + (std * stdDev),
        middle: sma[i],
        lower: sma[i] - (std * stdDev)
      });
    }

    return bands;
  }

  // Main Signal Generation
  generateSignal(chartData) {
    try {
      const { closes, highs, lows, volumes } = chartData;

      if (!closes || closes.length < 50) {
        return {
          signal: "INSUFFICIENT_DATA",
          confidence: 0,
          message: "Need at least 50 candles for analysis"
        };
      }

      // Calculate Indicators
      const rsi = this.calculateRSI(closes, 14);
      const { macdLine, histogram } = this.calculateMACD(closes);
      const atr = this.calculateATR(highs, lows, closes, 14);
      const bands = this.calculateBollingerBands(closes, 20, 2);

      // Get Latest Values
      const lastClose = closes[closes.length - 1];
      const lastHigh = highs[highs.length - 1];
      const lastLow = lows[lows.length - 1];
      const lastRSI = rsi[rsi.length - 1];
      const lastMACD = macdLine[macdLine.length - 1];
      const lastHistogram = histogram[histogram.length - 1];
      const lastATR = atr[atr.length - 1];
      const lastBands = bands[bands.length - 1];

      // ===== LAYER 1: TECHNICAL SCORE (0-25) =====
      let technicalScore = 0;

      // Trend Alignment (0-10)
      const trend = this.detectTrend(closes,);
      if (trend === "BULLISH") technicalScore += 10;
      else if (trend === "BEARISH") technicalScore -= 5;
      else technicalScore += 3;

      // Support/Resistance (0-10)
      if (lastBands && lastClose < lastBands.lower) technicalScore += 8; // Oversold
      if (lastBands && lastClose > lastBands.upper) technicalScore += 5; // Overbought
      if (lastBands && lastClose > lastBands.lower && lastClose < lastBands.upper) technicalScore += 3;

      // ===== LAYER 2: MOMENTUM SCORE (0-25) =====
      let momentumScore = 0;

      // RSI (0-10)
      if (lastRSI > 50 && lastRSI < 70) momentumScore += 10;
      else if (lastRSI > 30 && lastRSI < 50) momentumScore += 5;
      else if (lastRSI < 30) momentumScore -= 3;
      else momentumScore += 3;

      // MACD (0-8)
      if (lastHistogram > 0 && lastHistogram > lastHistogram - 0.01) momentumScore += 8;
      else if (lastHistogram > 0) momentumScore += 5;
      else momentumScore += 2;

      // Divergence (0-7)
      const divergence = this.detectRSIDivergence(closes, rsi);
      if (divergence === "BULLISH_DIVERGENCE") momentumScore += 7;
      else if (divergence === "BEARISH_DIVERGENCE") momentumScore -= 3;

      // ===== LAYER 3: ORDER FLOW SCORE (0-15) =====
      let orderFlowScore = 0;
      const volumeSpike = this.detectVolumeSpike(volumes);

      if (volumeSpike.spike && volumeSpike.ratio > 1.5) orderFlowScore += 10;
      else if (volumeSpike.spike) orderFlowScore += 7;
      else orderFlowScore += 2;

      // ===== LAYER 4: SENTIMENT SCORE (0-15) =====
      // In production, this would fetch real news sentiment
      // For now, we'll use a placeholder
      const sentimentScore = 8; // Neutral assumption

      // ===== CALCULATE FINAL CONFIDENCE =====
      const totalScore = technicalScore + momentumScore + orderFlowScore + sentimentScore;
      const confidence = Math.min(100, Math.max(0, totalScore));

      // ===== DETERMINE SIGNAL =====
      let signal = "NO_SIGNAL";
      if (confidence >= 80 && technicalScore > 5 && momentumScore > 8) signal = "STRONG_BUY";
      else if (confidence >= 65 && technicalScore > 3) signal = "MEDIUM_BUY";
      else if (confidence >= 50) signal = "WEAK_BUY";
      else if (confidence < 30) signal = "NO_SIGNAL";

      // Calculate Support/Resistance
      const volatility = lastATR * 2;
      const stopLoss = lastLow - volatility;
      const target1 = lastClose + (volatility * 1.5);
      const target2 = lastClose + (volatility * 2.5);

      return {
        signal,
        confidence: Math.round(confidence),
        timestamp: new Date().toISOString(),
        
        scores: {
          technical: technicalScore,
          momentum: momentumScore,
          orderFlow: orderFlowScore,
          sentiment: sentimentScore,
          total: totalScore
        },

        indicators: {
          trend,
          rsi: lastRSI ? Math.round(lastRSI) : 0,
          macd: lastMACD ? lastMACD.toFixed(4) : 0,
          divergence,
          volumeSpike: volumeSpike.spike,
          volumeRatio: parseFloat(volumeSpike.ratio)
        },

        priceAction: {
          currentPrice: lastClose,
          high: lastHigh,
          low: lastLow,
          stopLoss: Math.round(stopLoss * 100) / 100,
          target1: Math.round(target1 * 100) / 100,
          target2: Math.round(target2 * 100) / 100,
          riskReward: ((target1 - lastClose) / (lastClose - stopLoss)).toFixed(2)
        },

        recommendation: {
          entry: lastClose,
          positionSize: confidence > 70 ? "FULL (3-5% risk)" : confidence > 60 ? "MEDIUM (2-3% risk)" : "SMALL (1% risk)",
          timeframe: "4H-Daily"
        }
      };

    } catch (error) {
      return {
        signal: "ERROR",
        confidence: 0,
        error: error.message
      };
    }
  }
}

export default NEXUSAlgorithm;
