import { BUILTIN_KNOWLEDGE, STOPWORDS } from '../constants/knowledge';

class RAGEngine {
  constructor() {
    this.chunks   = [];
    this.tfidf    = [];
    this.idf      = {};
    this.loaded   = false;
    this.docName  = '';
    this.CHUNK_SIZE    = 80;
    this.CHUNK_OVERLAP = 20;
  }

  loadText(text, docName = 'document') {
    if (!text?.trim()) return false;
    const words = text.split(/\s+/).filter(Boolean);
    const step  = Math.max(1, this.CHUNK_SIZE - this.CHUNK_OVERLAP);
    this.chunks  = [];

    for (let i = 0; i < words.length; i += step) {
      const chunk = words.slice(i, i + this.CHUNK_SIZE).join(' ');
      if (chunk.trim()) this.chunks.push(chunk);
    }

    this.docName = docName;
    this._buildIndex();
    this.loaded = true;
    return true;
  }

  _tokenise(text) {
    return text.toLowerCase()
      .match(/[a-z]+/g)
      ?.filter(t => !STOPWORDS.has(t) && t.length > 2) || [];
  }

  _buildIndex() {
    const N = this.chunks.length;
    const tfList = [];
    const df = {};

    for (const chunk of this.chunks) {
      const tokens = this._tokenise(chunk);
      const total  = Math.max(tokens.length, 1);
      const tf = {};
      for (const t of tokens) {
        tf[t] = (tf[t] || 0) + 1;
      }
      const tfNorm = {};
      for (const [t, c] of Object.entries(tf)) {
        tfNorm[t] = c / total;
        df[t] = (df[t] || 0) + 1;
      }
      tfList.push(tfNorm);
    }

    this.idf = {};
    for (const [term, count] of Object.entries(df)) {
      this.idf[term] = Math.log((N + 1) / (count + 1)) + 1;
    }

    this.tfidf = tfList.map(tf => {
      const weighted = {};
      for (const [t, v] of Object.entries(tf)) {
        weighted[t] = v * (this.idf[t] || 1.0);
      }
      return weighted;
    });
  }

  retrieve(query) {
    if (!this.loaded || !this.chunks.length) return null;
    const qTokens = this._tokenise(query);
    if (!qTokens.length) return null;

    const scores = this.tfidf.map(cw =>
      qTokens.reduce((sum, t) => sum + (cw[t] || 0), 0)
    );

    const bestIdx   = scores.indexOf(Math.max(...scores));
    const bestScore = scores[bestIdx];

    return bestScore >= 0.01 ? this.chunks[bestIdx] : null;
  }

  clear() {
    this.chunks = []; this.tfidf = []; this.idf = {};
    this.loaded = false; this.docName = '';
  }
}

// Singleton instance
const rag = new RAGEngine();
rag.loadText(BUILTIN_KNOWLEDGE, 'built-in guide');

export default rag;
