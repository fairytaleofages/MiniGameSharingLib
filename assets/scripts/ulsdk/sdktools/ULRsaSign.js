
export function pkcs1unpad2(d,n) {
  var b = d.toByteArray();
  var i = 0;
  while(i < b.length && b[i] == 0) ++i;
  if(b.length-i != n-1 || b[i] != 2)
    return null;
  ++i;
  while(b[i] != 0)
    if(++i >= b.length) return null;
  var ret = "";
  while(++i < b.length) {
    var c = b[i] & 255;
    if(c < 128) { // utf-8 decode
      ret += String.fromCharCode(c);
    }
    else if((c > 191) && (c < 224)) {
      ret += String.fromCharCode(((c & 31) << 6) | (b[i+1] & 63));
      ++i;
    }
    else {
      ret += String.fromCharCode(((c & 15) << 12) | ((b[i+1] & 63) << 6) | (b[i+2] & 63));
      i += 2;
    }
  }
  return ret;
}

// PKCS#1 (OAEP) mask generation function
export function oaep_mgf1_str(seed, len, hash)
{
    var mask = '', i = 0;

    while (mask.length < len)
    {
        mask += hash(seed + String.fromCharCode.apply(String, [
                (i & 0xff000000) >> 24,
                (i & 0x00ff0000) >> 16,
                (i & 0x0000ff00) >> 8,
                i & 0x000000ff]));
        i += 1;
    }

    return mask;
}

export function oaep_unpad(d, n, hash, hashLen) {
    var MD = KJUR.crypto.MessageDigest;
    var Util = KJUR.crypto.Util;
    var algName = null;

    if (!hash) hash = "sha1";

    if (typeof hash === "string") {
        algName = MD.getCanonicalAlgName(hash);
        hashLen = MD.getHashLength(algName);
        hash = function(s) {
            return hextorstr(Util.hashHex(rstrtohex(s), algName));
        };
    }

    d = d.toByteArray();

    var i;

    for (i = 0; i < d.length; i += 1) {
        d[i] &= 0xff;
    }

    while (d.length < n) {
        d.unshift(0);
    }

    d = String.fromCharCode.apply(String, d);

    if (d.length < 2 * hashLen + 2) {
        throw "Cipher too short";
    }

    var maskedSeed = d.substr(1, hashLen)
    var maskedDB = d.substr(hashLen + 1);

    var seedMask = oaep_mgf1_str(maskedDB, hashLen, hash);
    var seed = [], i;

    for (i = 0; i < maskedSeed.length; i += 1) {
        seed[i] = maskedSeed.charCodeAt(i) ^ seedMask.charCodeAt(i);
    }

    var dbMask = oaep_mgf1_str(String.fromCharCode.apply(String, seed),
                               d.length - hashLen, hash);

    var DB = [];

    for (i = 0; i < maskedDB.length; i += 1) {
        DB[i] = maskedDB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    DB = String.fromCharCode.apply(String, DB);

    if (DB.substr(0, hashLen) !== hash('')) {
        throw "Hash mismatch";
    }

    DB = DB.substr(hashLen);

    var first_one = DB.indexOf('\x01');
    var last_zero = (first_one != -1) ? DB.substr(0, first_one).lastIndexOf('\x00') : -1;

    if (last_zero + 1 != first_one) {
        throw "Malformed data";
    }

    return DB.substr(first_one + 1);
}

// Set the private key fields N, e, and d from hex strings
export function RSASetPrivate(N,E,D) {
  this.isPrivate = true;
  if (typeof N !== "string")
  {
    this.n = N;
    this.e = E;
    this.d = D;
  }
  else if(N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);
    this.d = parseBigInt(D,16);
  }
  else
    throw "Invalid RSA private key";
}

// Set the private key fields N, e, d and CRT params from hex strings
export function RSASetPrivateEx(N,E,D,P,Q,DP,DQ,C) {
  this.isPrivate = true;
  this.isPublic = false;
  if (N == null) throw "RSASetPrivateEx N == null";
  if (E == null) throw "RSASetPrivateEx E == null";
  if (N.length == 0) throw "RSASetPrivateEx N.length == 0";
  if (E.length == 0) throw "RSASetPrivateEx E.length == 0";

  if (N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);
    this.d = parseBigInt(D,16);
    this.p = parseBigInt(P,16);
    this.q = parseBigInt(Q,16);
    this.dmp1 = parseBigInt(DP,16);
    this.dmq1 = parseBigInt(DQ,16);
    this.coeff = parseBigInt(C,16);
  } else {
    throw "Invalid RSA private key in RSASetPrivateEx";
  }
}

// Generate a new random private key B bits long, using public expt E
export function RSAGenerate(B,E) {
  var rng = new SecureRandom();
  var qs = B>>1;
  this.e = parseInt(E,16);
  var ee = new BigInteger(E,16);
  for(;;) {
    for(;;) {
      this.p = new BigInteger(B-qs,1,rng);
      if(this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.p.isProbablePrime(10)) break;
    }
    for(;;) {
      this.q = new BigInteger(qs,1,rng);
      if(this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.q.isProbablePrime(10)) break;
    }
    if(this.p.compareTo(this.q) <= 0) {
      var t = this.p;
      this.p = this.q;
      this.q = t;
    }
    var p1 = this.p.subtract(BigInteger.ONE); // p1 = p - 1
    var q1 = this.q.subtract(BigInteger.ONE); // q1 = q - 1
    var phi = p1.multiply(q1);
    if(phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
      this.n = this.p.multiply(this.q); // this.n = p * q
      this.d = ee.modInverse(phi);  // this.d = 
      this.dmp1 = this.d.mod(p1); // this.dmp1 = d mod (p - 1)
      this.dmq1 = this.d.mod(q1); // this.dmq1 = d mod (q - 1)
      this.coeff = this.q.modInverse(this.p); // this.coeff = (q ^ -1) mod p
      break;
    }
  }
  this.isPrivate = true;
}

// Perform raw private operation on "x": return x^d (mod n)
export function RSADoPrivate(x) {
  if(this.p == null || this.q == null)
    return x.modPow(this.d, this.n);

  // TODO: re-calculate any missing CRT params
  var xp = x.mod(this.p).modPow(this.dmp1, this.p); // xp=cp?
  var xq = x.mod(this.q).modPow(this.dmq1, this.q); // xq=cq?

  while(xp.compareTo(xq) < 0)
    xp = xp.add(this.p);
  return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
}

export function RSADecrypt(ctext) {
  var c = parseBigInt(ctext, 16);
  var m = this.doPrivate(c);
  if(m == null) return null;
  return pkcs1unpad2(m, (this.n.bitLength()+7)>>3);
}

export function RSADecryptOAEP(ctext, hash, hashLen) {
  var c = parseBigInt(ctext, 16);
  var m = this.doPrivate(c);
  if(m == null) return null;
  return oaep_unpad(m, (this.n.bitLength()+7)>>3, hash, hashLen);
}

// protected
RSAKey.prototype.doPrivate = RSADoPrivate;

// public
RSAKey.prototype.setPrivate = RSASetPrivate;
RSAKey.prototype.setPrivateEx = RSASetPrivateEx;
RSAKey.prototype.generate = RSAGenerate;
RSAKey.prototype.decrypt = RSADecrypt;
RSAKey.prototype.decryptOAEP = RSADecryptOAEP;
//RSAKey.prototype.b64_decrypt = RSAB64Decrypt;

// (public)
function bnClone() { var r = nbi(); this.copyTo(r); return r; }

// (public) return value as integer
export function bnIntValue() {
  if(this.s < 0) {
    if(this.t == 1) return this[0]-this.DV;
    else if(this.t == 0) return -1;
  }
  else if(this.t == 1) return this[0];
  else if(this.t == 0) return 0;
  // assumes 16 < DB < 32
  return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
}

// (public) return value as byte
export function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

// (public) return value as short (assumes DB>=16)
export function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

// (protected) return x s.t. r^x < DV
export function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

// (public) 0 if this == 0, 1 if this > 0
export function bnSigNum() {
  if(this.s < 0) return -1;
  else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
  else return 1;
}

// (protected) convert to radix string
export function bnpToRadix(b) {
  if(b == null) b = 10;
  if(this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b,cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d,y,z);
  while(y.signum() > 0) {
    r = (a+z.intValue()).toString(b).substr(1) + r;
    y.divRemTo(d,y,z);
  }
  return z.intValue().toString(b) + r;
}

// (protected) convert from radix string
export function bnpFromRadix(s,b) {
  this.fromInt(0);
  if(b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
  for(var i = 0; i < s.length; ++i) {
    var x = intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
      continue;
    }
    w = b*w+x;
    if(++j >= cs) {
      this.dMultiply(d);
      this.dAddOffset(w,0);
      j = 0;
      w = 0;
    }
  }
  if(j > 0) {
    this.dMultiply(Math.pow(b,j));
    this.dAddOffset(w,0);
  }
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) alternate constructor
export function bnpFromNumber(a,b,c) {
  if("number" == typeof b) {
    // new BigInteger(int,int,RNG)
    if(a < 2) this.fromInt(1);
    else {
      this.fromNumber(a,c);
      if(!this.testBit(a-1))  // force MSB set
        this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
      if(this.isEven()) this.dAddOffset(1,0); // force odd
      while(!this.isProbablePrime(b)) {
        this.dAddOffset(2,0);
        if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
      }
    }
  }
  else {
    // new BigInteger(int,RNG)
    var x = new Array(), t = a&7;
    x.length = (a>>3)+1;
    b.nextBytes(x);
    if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
    this.fromString(x,256);
  }
}

// (public) convert to bigendian byte array
export function bnToByteArray() {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB-(i*this.DB)%8, d, k = 0;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
      r[k++] = d|(this.s<<(this.DB-p));
    while(i >= 0) {
      if(p < 8) {
        d = (this[i]&((1<<p)-1))<<(8-p);
        d |= this[--i]>>(p+=this.DB-8);
      }
      else {
        d = (this[i]>>(p-=8))&0xff;
        if(p <= 0) { p += this.DB; --i; }
      }
      if((d&0x80) != 0) d |= -256;
      if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
      if(k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
}

function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

// (protected) r = this op a (bitwise)
export function bnpBitwiseTo(a,op,r) {
  var i, f, m = Math.min(a.t,this.t);
  for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
  if(a.t < this.t) {
    f = a.s&this.DM;
    for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
    r.t = this.t;
  }
  else {
    f = this.s&this.DM;
    for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
    r.t = a.t;
  }
  r.s = op(this.s,a.s);
  r.clamp();
}

// (public) this & a
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

// (public) this | a
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

// (public) this ^ a
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

// (public) this & ~a
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

// (public) ~this
function bnNot() {
  var r = nbi();
  for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
  r.t = this.t;
  r.s = ~this.s;
  return r;
}

// (public) this << n
function bnShiftLeft(n) {
  var r = nbi();
  if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
  return r;
}

// (public) this >> n
function bnShiftRight(n) {
  var r = nbi();
  if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
  return r;
}

// return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
  if(x == 0) return -1;
  var r = 0;
  if((x&0xffff) == 0) { x >>= 16; r += 16; }
  if((x&0xff) == 0) { x >>= 8; r += 8; }
  if((x&0xf) == 0) { x >>= 4; r += 4; }
  if((x&3) == 0) { x >>= 2; r += 2; }
  if((x&1) == 0) ++r;
  return r;
}

// (public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
  for(var i = 0; i < this.t; ++i)
    if(this[i] != 0) return i*this.DB+lbit(this[i]);
  if(this.s < 0) return this.t*this.DB;
  return -1;
}

// return number of 1 bits in x
function cbit(x) {
  var r = 0;
  while(x != 0) { x &= x-1; ++r; }
  return r;
}

// (public) return number of set bits
function bnBitCount() {
  var r = 0, x = this.s&this.DM;
  for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
  return r;
}

// (public) true iff nth bit is set
function bnTestBit(n) {
  var j = Math.floor(n/this.DB);
  if(j >= this.t) return(this.s!=0);
  return((this[j]&(1<<(n%this.DB)))!=0);
}

// (protected) this op (1<<n)
function bnpChangeBit(n,op) {
  var r = BigInteger.ONE.shiftLeft(n);
  this.bitwiseTo(r,op,r);
  return r;
}

// (public) this | (1<<n)
function bnSetBit(n) { return this.changeBit(n,op_or); }

// (public) this & ~(1<<n)
function bnClearBit(n) { return this.changeBit(n,op_andnot); }

// (public) this ^ (1<<n)
function bnFlipBit(n) { return this.changeBit(n,op_xor); }

// (protected) r = this + a
function bnpAddTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]+a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c += a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c += a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = (c<0)?-1:0;
  if(c > 0) r[i++] = c;
  else if(c < -1) r[i++] = this.DV+c;
  r.t = i;
  r.clamp();
}

// (public) this + a
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

// (public) this - a
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

// (public) this * a
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

// (public) this^2
function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

// (public) this / a
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

// (public) this % a
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

// (public) [this/a,this%a]
function bnDivideAndRemainder(a) {
  var q = nbi(), r = nbi();
  this.divRemTo(a,q,r);
  return new Array(q,r);
}

// (protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
  this[this.t] = this.am(0,n-1,this,0,0,this.t);
  ++this.t;
  this.clamp();
}

// (protected) this += n << w words, this >= 0
function bnpDAddOffset(n,w) {
  if(n == 0) return;
  while(this.t <= w) this[this.t++] = 0;
  this[w] += n;
  while(this[w] >= this.DV) {
    this[w] -= this.DV;
    if(++w >= this.t) this[this.t++] = 0;
    ++this[w];
  }
}

// A "null" reducer
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

// (public) this^e
function bnPow(e) { return this.exp(e,new NullExp()); }

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a,n,r) {
  var i = Math.min(this.t+a.t,n);
  r.s = 0; // assumes a,this >= 0
  r.t = i;
  while(i > 0) r[--i] = 0;
  var j;
  for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
  for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
  r.clamp();
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a,n,r) {
  --n;
  var i = r.t = this.t+a.t-n;
  r.s = 0; // assumes a,this >= 0
  while(--i >= 0) r[i] = 0;
  for(i = Math.max(n-this.t,0); i < a.t; ++i)
    r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
  r.clamp();
  r.drShiftTo(1,r);
}

// Barrett modular reduction
function Barrett(m) {
  // setup Barrett
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
  this.mu = this.r2.divide(m);
  this.m = m;
}

function barrettConvert(x) {
  if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
  else if(x.compareTo(this.m) < 0) return x;
  else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}

function barrettRevert(x) { return x; }

// x = x mod m (HAC 14.42)
function barrettReduce(x) {
  x.drShiftTo(this.m.t-1,this.r2);
  if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
  this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
  this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
  while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
  x.subTo(this.r2,x);
  while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = x^2 mod m; x != r
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = x*y mod m; x,y != r
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

// (public) this^e % m (HAC 14.85)
function bnModPow(e,m) {
  var i = e.bitLength(), k, r = nbv(1), z;
  if(i <= 0) return r;
  else if(i < 18) k = 1;
  else if(i < 48) k = 3;
  else if(i < 144) k = 4;
  else if(i < 768) k = 5;
  else k = 6;
  if(i < 8)
    z = new Classic(m);
  else if(m.isEven())
    z = new Barrett(m);
  else
    z = new Montgomery(m);

  // precomputation
  var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
  g[1] = z.convert(this);
  if(k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1],g2);
    while(n <= km) {
      g[n] = nbi();
      z.mulTo(g2,g[n-2],g[n]);
      n += 2;
    }
  }

  var j = e.t-1, w, is1 = true, r2 = nbi(), t;
  i = nbits(e[j])-1;
  while(j >= 0) {
    if(i >= k1) w = (e[j]>>(i-k1))&km;
    else {
      w = (e[j]&((1<<(i+1))-1))<<(k1-i);
      if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
    }

    n = k;
    while((w&1) == 0) { w >>= 1; --n; }
    if((i -= n) < 0) { i += this.DB; --j; }
    if(is1) { // ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r);
      is1 = false;
    }
    else {
      while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
      if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
      z.mulTo(r2,g[w],r);
    }

    while(j >= 0 && (e[j]&(1<<i)) == 0) {
      z.sqrTo(r,r2); t = r; r = r2; r2 = t;
      if(--i < 0) { i = this.DB-1; --j; }
    }
  }
  return z.revert(r);
}

// (public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
  var x = (this.s<0)?this.negate():this.clone();
  var y = (a.s<0)?a.negate():a.clone();
  if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
  var i = x.getLowestSetBit(), g = y.getLowestSetBit();
  if(g < 0) return x;
  if(i < g) g = i;
  if(g > 0) {
    x.rShiftTo(g,x);
    y.rShiftTo(g,y);
  }
  while(x.signum() > 0) {
    if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
    if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
    if(x.compareTo(y) >= 0) {
      x.subTo(y,x);
      x.rShiftTo(1,x);
    }
    else {
      y.subTo(x,y);
      y.rShiftTo(1,y);
    }
  }
  if(g > 0) y.lShiftTo(g,y);
  return y;
}

// (protected) this % n, n < 2^26
function bnpModInt(n) {
  if(n <= 0) return 0;
  var d = this.DV%n, r = (this.s<0)?n-1:0;
  if(this.t > 0)
    if(d == 0) r = this[0]%n;
    else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
  return r;
}

// (public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
  var ac = m.isEven();
  if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
  var u = m.clone(), v = this.clone();
  var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
  while(u.signum() != 0) {
    while(u.isEven()) {
      u.rShiftTo(1,u);
      if(ac) {
        if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
        a.rShiftTo(1,a);
      }
      else if(!b.isEven()) b.subTo(m,b);
      b.rShiftTo(1,b);
    }
    while(v.isEven()) {
      v.rShiftTo(1,v);
      if(ac) {
        if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
        c.rShiftTo(1,c);
      }
      else if(!d.isEven()) d.subTo(m,d);
      d.rShiftTo(1,d);
    }
    if(u.compareTo(v) >= 0) {
      u.subTo(v,u);
      if(ac) a.subTo(c,a);
      b.subTo(d,b);
    }
    else {
      v.subTo(u,v);
      if(ac) c.subTo(a,c);
      d.subTo(b,d);
    }
  }
  if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
  if(d.compareTo(m) >= 0) return d.subtract(m);
  if(d.signum() < 0) d.addTo(m,d); else return d;
  if(d.signum() < 0) return d.add(m); else return d;
}

var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];

// (public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
  var i, x = this.abs();
  if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
    for(i = 0; i < lowprimes.length; ++i)
      if(x[0] == lowprimes[i]) return true;
    return false;
  }
  if(x.isEven()) return false;
  i = 1;
  while(i < lowprimes.length) {
    var m = lowprimes[i], j = i+1;
    while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
    m = x.modInt(m);
    while(i < j) if(m%lowprimes[i++] == 0) return false;
  }
  return x.millerRabin(t);
}

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
  var n1 = this.subtract(BigInteger.ONE);
  var k = n1.getLowestSetBit();
  if(k <= 0) return false;
  var r = n1.shiftRight(k);
  t = (t+1)>>1;
  if(t > lowprimes.length) t = lowprimes.length;
  var a = nbi();
  for(var i = 0; i < t; ++i) {
    //Pick bases at random, instead of starting at 2
    a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
    var y = a.modPow(r,this);
    if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1;
      while(j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2,this);
        if(y.compareTo(BigInteger.ONE) == 0) return false;
      }
      if(y.compareTo(n1) != 0) return false;
    }
  }
  return true;
}

// protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

// public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

// JSBN-specific extension
BigInteger.prototype.square = bnSquare;



if (YAHOO === undefined) {var YAHOO = {};}
YAHOO.lang = {
    /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     *
     * @method extend
     * @static
     * @param {Function} subc   the object to modify
     * @param {Function} superc the object to inherit
     * @param {Object} overrides  additional properties/methods to add to the
     *                              subclass prototype.  These will override the
     *                              matching items obtained from the superclass
     *                              if present.
     */
    extend: function(subc, superc, overrides) {
  if (! superc || ! subc) {
            throw new Error("YAHOO.lang.extend failed, please check that " +
                            "all dependencies are included.");
  }
  
  var F = function() {};
  F.prototype = superc.prototype;
  subc.prototype = new F();
  subc.prototype.constructor = subc;
  subc.superclass = superc.prototype;
     
  if (superc.prototype.constructor == Object.prototype.constructor) {
            superc.prototype.constructor = superc;
  }
 
  if (overrides) {
      var i;
            for (i in overrides) {
    subc.prototype[i] = overrides[i];
            }

      var _IEEnumFix = function() {},
    ADD = ["toString", "valueOf"];
      try {
    if (/MSIE/.test(navigator.userAgent)) {
        _IEEnumFix = function(r, s) {
      for (i = 0; i < ADD.length; i = i + 1) {
          var fname = ADD[i], f = s[fname];
          if (typeof f === 'function' && f != Object.prototype[fname]) {
        r[fname] = f;
          }
      }
        };
    }
      } catch (ex) {};
            _IEEnumFix(subc.prototype, overrides);
  }
    }
};

if (typeof KJUR == "undefined" || !KJUR) KJUR = {};

if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) KJUR.asn1 = {};

/**
 * ASN1 utilities class
 * @name KJUR.asn1.ASN1Util
 * @class ASN1 utilities class
 * @since asn1 1.0.2
 */
KJUR.asn1.ASN1Util = new function() {
    this.integerToByteHex = function(i) {
        var h = i.toString(16);
        if ((h.length % 2) == 1) h = '0' + h;
        return h;
    };
    this.bigIntToMinTwosComplementsHex = function(bigIntegerValue) {
        var h = bigIntegerValue.toString(16);
        if (h.substr(0, 1) != '-') {
            if (h.length % 2 == 1) {
                h = '0' + h;
            } else {
                if (! h.match(/^[0-7]/)) {
                    h = '00' + h;
                }
            }
        } else {
            var hPos = h.substr(1);
            var xorLen = hPos.length;
            if (xorLen % 2 == 1) {
                xorLen += 1;
            } else {
                if (! h.match(/^[0-7]/)) {
                    xorLen += 2;
                }
            }
            var hMask = '';
            for (var i = 0; i < xorLen; i++) {
                hMask += 'f';
            }
            var biMask = new BigInteger(hMask, 16);
            var biNeg = biMask.xor(bigIntegerValue).add(BigInteger.ONE);
            h = biNeg.toString(16).replace(/^-/, '');
        }
        return h;
    };
   
    this.getPEMStringFromHex = function(dataHex, pemHeader) {
  return hextopem(dataHex, pemHeader);
    };

    this.newObject = function(param) {
  var _KJUR = KJUR,
      _KJUR_asn1 = _KJUR.asn1,
      _DERBoolean = _KJUR_asn1.DERBoolean,
      _DERInteger = _KJUR_asn1.DERInteger,
      _DERBitString = _KJUR_asn1.DERBitString,
      _DEROctetString = _KJUR_asn1.DEROctetString,
      _DERNull = _KJUR_asn1.DERNull,
      _DERObjectIdentifier = _KJUR_asn1.DERObjectIdentifier,
      _DEREnumerated = _KJUR_asn1.DEREnumerated,
      _DERUTF8String = _KJUR_asn1.DERUTF8String,
      _DERNumericString = _KJUR_asn1.DERNumericString,
      _DERPrintableString = _KJUR_asn1.DERPrintableString,
      _DERTeletexString = _KJUR_asn1.DERTeletexString,
      _DERIA5String = _KJUR_asn1.DERIA5String,
      _DERUTCTime = _KJUR_asn1.DERUTCTime,
      _DERGeneralizedTime = _KJUR_asn1.DERGeneralizedTime,
      _DERSequence = _KJUR_asn1.DERSequence,
      _DERSet = _KJUR_asn1.DERSet,
      _DERTaggedObject = _KJUR_asn1.DERTaggedObject,
      _newObject = _KJUR_asn1.ASN1Util.newObject;

        var keys = Object.keys(param);
        if (keys.length != 1)
            throw "key of param shall be only one.";
        var key = keys[0];

        if (":bool:int:bitstr:octstr:null:oid:enum:utf8str:numstr:prnstr:telstr:ia5str:utctime:gentime:seq:set:tag:".indexOf(":" + key + ":") == -1)
            throw "undefined key: " + key;

        if (key == "bool")    return new _DERBoolean(param[key]);
        if (key == "int")     return new _DERInteger(param[key]);
        if (key == "bitstr")  return new _DERBitString(param[key]);
        if (key == "octstr")  return new _DEROctetString(param[key]);
        if (key == "null")    return new _DERNull(param[key]);
        if (key == "oid")     return new _DERObjectIdentifier(param[key]);
        if (key == "enum")    return new _DEREnumerated(param[key]);
        if (key == "utf8str") return new _DERUTF8String(param[key]);
        if (key == "numstr")  return new _DERNumericString(param[key]);
        if (key == "prnstr")  return new _DERPrintableString(param[key]);
        if (key == "telstr")  return new _DERTeletexString(param[key]);
        if (key == "ia5str")  return new _DERIA5String(param[key]);
        if (key == "utctime") return new _DERUTCTime(param[key]);
        if (key == "gentime") return new _DERGeneralizedTime(param[key]);

        if (key == "seq") {
            var paramList = param[key];
            var a = [];
            for (var i = 0; i < paramList.length; i++) {
                var asn1Obj = _newObject(paramList[i]);
                a.push(asn1Obj);
            }
            return new _DERSequence({'array': a});
        }

        if (key == "set") {
            var paramList = param[key];
            var a = [];
            for (var i = 0; i < paramList.length; i++) {
                var asn1Obj = _newObject(paramList[i]);
                a.push(asn1Obj);
            }
            return new _DERSet({'array': a});
        }

        if (key == "tag") {
            var tagParam = param[key];
            if (Object.prototype.toString.call(tagParam) === '[object Array]' &&
                tagParam.length == 3) {
                var obj = _newObject(tagParam[2]);
                return new _DERTaggedObject({tag: tagParam[0],
               explicit: tagParam[1],
               obj: obj});
            } else {
                var newParam = {};
                if (tagParam.explicit !== undefined)
                    newParam.explicit = tagParam.explicit;
                if (tagParam.tag !== undefined)
                    newParam.tag = tagParam.tag;
                if (tagParam.obj === undefined)
                    throw "obj shall be specified for 'tag'.";
                newParam.obj = _newObject(tagParam.obj);
                return new _DERTaggedObject(newParam);
            }
        }
    };

    this.jsonToASN1HEX = function(param) {
        var asn1Obj = this.newObject(param);
        return asn1Obj.getEncodedHex();
    };
};

KJUR.asn1.ASN1Util.oidHexToInt = function(hex) {
    var s = "";
    var i01 = parseInt(hex.substr(0, 2), 16);
    var i0 = Math.floor(i01 / 40);
    var i1 = i01 % 40;
    var s = i0 + "." + i1;

    var binbuf = "";
    for (var i = 2; i < hex.length; i += 2) {
  var value = parseInt(hex.substr(i, 2), 16);
        var bin = ("00000000" + value.toString(2)).slice(- 8);
  binbuf = binbuf + bin.substr(1, 7);
  if (bin.substr(0, 1) == "0") {
      var bi = new BigInteger(binbuf, 2);
      s = s + "." + bi.toString(10);
      binbuf = "";
  }
    };

    return s;
};


KJUR.asn1.ASN1Util.oidIntToHex = function(oidString) {
    var itox = function(i) {
        var h = i.toString(16);
        if (h.length == 1) h = '0' + h;
        return h;
    };

    var roidtox = function(roid) {
        var h = '';
        var bi = new BigInteger(roid, 10);
        var b = bi.toString(2);
        var padLen = 7 - b.length % 7;
        if (padLen == 7) padLen = 0;
        var bPad = '';
        for (var i = 0; i < padLen; i++) bPad += '0';
        b = bPad + b;
        for (var i = 0; i < b.length - 1; i += 7) {
            var b8 = b.substr(i, 7);
            if (i != b.length - 7) b8 = '1' + b8;
            h += itox(parseInt(b8, 2));
        }
        return h;
    };
    
    if (! oidString.match(/^[0-9.]+$/)) {
        throw "malformed oid string: " + oidString;
    }
    var h = '';
    var a = oidString.split('.');
    var i0 = parseInt(a[0]) * 40 + parseInt(a[1]);
    h += itox(i0);
    a.splice(0, 2);
    for (var i = 0; i < a.length; i++) {
        h += roidtox(a[i]);
    }
    return h;
};


KJUR.asn1.ASN1Object = function() {
    var isModified = true;
    var hTLV = null;
    var hT = '00';
    var hL = '00';
    var hV = '';

    this.getLengthHexFromValue = function() {
        if (typeof this.hV == "undefined" || this.hV == null) {
            throw "this.hV is null or undefined.";
        }
        if (this.hV.length % 2 == 1) {
            throw "value hex must be even length: n=" + hV.length + ",v=" + this.hV;
        }
        var n = this.hV.length / 2;
        var hN = n.toString(16);
        if (hN.length % 2 == 1) {
            hN = "0" + hN;
        }
        if (n < 128) {
            return hN;
        } else {
            var hNlen = hN.length / 2;
            if (hNlen > 15) {
                throw "ASN.1 length too long to represent by 8x: n = " + n.toString(16);
            }
            var head = 128 + hNlen;
            return head.toString(16) + hN;
        }
    };

    
    this.getEncodedHex = function() {
        if (this.hTLV == null || this.isModified) {
            this.hV = this.getFreshValueHex();
            this.hL = this.getLengthHexFromValue();
            this.hTLV = this.hT + this.hL + this.hV;
            this.isModified = false;
            //alert("first time: " + this.hTLV);
        }
        return this.hTLV;
    };

    this.getValueHex = function() {
        this.getEncodedHex();
        return this.hV;
    }

    this.getFreshValueHex = function() {
        return '';
    };
};

KJUR.asn1.DERAbstractString = function(params) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var s = null;
    var hV = null;

    
    this.getString = function() {
        return this.s;
    };

    
    this.setString = function(newS) {
        this.hTLV = null;
        this.isModified = true;
        this.s = newS;
        this.hV = utf8tohex(this.s).toLowerCase();
    };

    this.setStringHex = function(newHexString) {
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = newHexString;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params == "string") {
            this.setString(params);
        } else if (typeof params['str'] != "undefined") {
            this.setString(params['str']);
        } else if (typeof params['hex'] != "undefined") {
            this.setStringHex(params['hex']);
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERAbstractString, KJUR.asn1.ASN1Object);

KJUR.asn1.DERAbstractTime = function(params) {
    KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);
    var s = null;
    var date = null;

    // --- PRIVATE METHODS --------------------
    this.localDateToUTC = function(d) {
        utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        var utcDate = new Date(utc);
        return utcDate;
    };

    
    this.formatDate = function(dateObject, type, withMillis) {
        var pad = this.zeroPadding;
        var d = this.localDateToUTC(dateObject);
        var year = String(d.getFullYear());
        if (type == 'utc') year = year.substr(2, 2);
        var month = pad(String(d.getMonth() + 1), 2);
        var day = pad(String(d.getDate()), 2);
        var hour = pad(String(d.getHours()), 2);
        var min = pad(String(d.getMinutes()), 2);
        var sec = pad(String(d.getSeconds()), 2);
        var s = year + month + day + hour + min + sec;
        if (withMillis === true) {
            var millis = d.getMilliseconds();
            if (millis != 0) {
                var sMillis = pad(String(millis), 3);
                sMillis = sMillis.replace(/[0]+$/, "");
                s = s + "." + sMillis;
            }
        }
        return s + "Z";
    };

    this.zeroPadding = function(s, len) {
        if (s.length >= len) return s;
        return new Array(len - s.length + 1).join('0') + s;
    };

    this.getString = function() {
        return this.s;
    };

    
    this.setString = function(newS) {
        this.hTLV = null;
        this.isModified = true;
        this.s = newS;
        this.hV = stohex(newS);
    };

    
    this.setByDateValue = function(year, month, day, hour, min, sec) {
        var dateObject = new Date(Date.UTC(year, month - 1, day, hour, min, sec, 0));
        this.setByDate(dateObject);
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };
};
YAHOO.lang.extend(KJUR.asn1.DERAbstractTime, KJUR.asn1.ASN1Object);

KJUR.asn1.DERAbstractStructured = function(params) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var asn1Array = null;

    
    this.setByASN1ObjectArray = function(asn1ObjectArray) {
        this.hTLV = null;
        this.isModified = true;
        this.asn1Array = asn1ObjectArray;
    };

    this.appendASN1Object = function(asn1Object) {
        this.hTLV = null;
        this.isModified = true;
        this.asn1Array.push(asn1Object);
    };

    this.asn1Array = new Array();
    if (typeof params != "undefined") {
        if (typeof params['array'] != "undefined") {
            this.asn1Array = params['array'];
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERAbstractStructured, KJUR.asn1.ASN1Object);


KJUR.asn1.DERBoolean = function() {
    KJUR.asn1.DERBoolean.superclass.constructor.call(this);
    this.hT = "01";
    this.hTLV = "0101ff";
};
YAHOO.lang.extend(KJUR.asn1.DERBoolean, KJUR.asn1.ASN1Object);


KJUR.asn1.DERInteger = function(params) {
    KJUR.asn1.DERInteger.superclass.constructor.call(this);
    this.hT = "02";

   
    this.setByBigInteger = function(bigIntegerValue) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(bigIntegerValue);
    };

    
    this.setByInteger = function(intValue) {
        var bi = new BigInteger(String(intValue), 10);
        this.setByBigInteger(bi);
    };

    this.setValueHex = function(newHexString) {
        this.hV = newHexString;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params['bigint'] != "undefined") {
            this.setByBigInteger(params['bigint']);
        } else if (typeof params['int'] != "undefined") {
            this.setByInteger(params['int']);
        } else if (typeof params == "number") {
            this.setByInteger(params);
        } else if (typeof params['hex'] != "undefined") {
            this.setValueHex(params['hex']);
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERInteger, KJUR.asn1.ASN1Object);


KJUR.asn1.DERBitString = function(params) {
    if (params !== undefined && typeof params.obj !== "undefined") {
  var o = KJUR.asn1.ASN1Util.newObject(params.obj);
  params.hex = "00" + o.getEncodedHex();
    }
    KJUR.asn1.DERBitString.superclass.constructor.call(this);
    this.hT = "03";

    
    this.setHexValueIncludingUnusedBits = function(newHexStringIncludingUnusedBits) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = newHexStringIncludingUnusedBits;
    };

   
    this.setUnusedBitsAndHexValue = function(unusedBits, hValue) {
        if (unusedBits < 0 || 7 < unusedBits) {
            throw "unused bits shall be from 0 to 7: u = " + unusedBits;
        }
        var hUnusedBits = "0" + unusedBits;
        this.hTLV = null;
        this.isModified = true;
        this.hV = hUnusedBits + hValue;
    };

    
    this.setByBinaryString = function(binaryString) {
        binaryString = binaryString.replace(/0+$/, '');
        var unusedBits = 8 - binaryString.length % 8;
        if (unusedBits == 8) unusedBits = 0;
        for (var i = 0; i <= unusedBits; i++) {
            binaryString += '0';
        }
        var h = '';
        for (var i = 0; i < binaryString.length - 1; i += 8) {
            var b = binaryString.substr(i, 8);
            var x = parseInt(b, 2).toString(16);
            if (x.length == 1) x = '0' + x;
            h += x;  
        }
        this.hTLV = null;
        this.isModified = true;
        this.hV = '0' + unusedBits + h;
    };

    
    this.setByBooleanArray = function(booleanArray) {
        var s = '';
        for (var i = 0; i < booleanArray.length; i++) {
            if (booleanArray[i] == true) {
                s += '1';
            } else {
                s += '0';
            }
        }
        this.setByBinaryString(s);
    };

    
    this.newFalseArray = function(nLength) {
        var a = new Array(nLength);
        for (var i = 0; i < nLength; i++) {
            a[i] = false;
        }
        return a;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params == "string" && params.toLowerCase().match(/^[0-9a-f]+$/)) {
            this.setHexValueIncludingUnusedBits(params);
        } else if (typeof params['hex'] != "undefined") {
            this.setHexValueIncludingUnusedBits(params['hex']);
        } else if (typeof params['bin'] != "undefined") {
            this.setByBinaryString(params['bin']);
        } else if (typeof params['array'] != "undefined") {
            this.setByBooleanArray(params['array']);
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERBitString, KJUR.asn1.ASN1Object);


KJUR.asn1.DEROctetString = function(params) {
    if (params !== undefined && typeof params.obj !== "undefined") {
  var o = KJUR.asn1.ASN1Util.newObject(params.obj);
  params.hex = o.getEncodedHex();
    }
    KJUR.asn1.DEROctetString.superclass.constructor.call(this, params);
    this.hT = "04";
};
YAHOO.lang.extend(KJUR.asn1.DEROctetString, KJUR.asn1.DERAbstractString);


KJUR.asn1.DERNull = function() {
    KJUR.asn1.DERNull.superclass.constructor.call(this);
    this.hT = "05";
    this.hTLV = "0500";
};
YAHOO.lang.extend(KJUR.asn1.DERNull, KJUR.asn1.ASN1Object);


KJUR.asn1.DERObjectIdentifier = function(params) {
    var itox = function(i) {
        var h = i.toString(16);
        if (h.length == 1) h = '0' + h;
        return h;
    };
    var roidtox = function(roid) {
        var h = '';
        var bi = new BigInteger(roid, 10);
        var b = bi.toString(2);
        var padLen = 7 - b.length % 7;
        if (padLen == 7) padLen = 0;
        var bPad = '';
        for (var i = 0; i < padLen; i++) bPad += '0';
        b = bPad + b;
        for (var i = 0; i < b.length - 1; i += 7) {
            var b8 = b.substr(i, 7);
            if (i != b.length - 7) b8 = '1' + b8;
            h += itox(parseInt(b8, 2));
        }
        return h;
    }

    KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);
    this.hT = "06";

    
    this.setValueHex = function(newHexString) {
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = newHexString;
    };

    
    this.setValueOidString = function(oidString) {
        if (! oidString.match(/^[0-9.]+$/)) {
            throw "malformed oid string: " + oidString;
        }
        var h = '';
        var a = oidString.split('.');
        var i0 = parseInt(a[0]) * 40 + parseInt(a[1]);
        h += itox(i0);
        a.splice(0, 2);
        for (var i = 0; i < a.length; i++) {
            h += roidtox(a[i]);
        }
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = h;
    };

    this.setValueName = function(oidName) {
  var oid = KJUR.asn1.x509.OID.name2oid(oidName);
  if (oid !== '') {
            this.setValueOidString(oid);
        } else {
            throw "DERObjectIdentifier oidName undefined: " + oidName;
        }
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (params !== undefined) {
        if (typeof params === "string") {
      if (params.match(/^[0-2].[0-9.]+$/)) {
    this.setValueOidString(params);
      } else {
    this.setValueName(params);
      }
        } else if (params.oid !== undefined) {
            this.setValueOidString(params.oid);
        } else if (params.hex !== undefined) {
            this.setValueHex(params.hex);
        } else if (params.name !== undefined) {
            this.setValueName(params.name);
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERObjectIdentifier, KJUR.asn1.ASN1Object);


KJUR.asn1.DEREnumerated = function(params) {
    KJUR.asn1.DEREnumerated.superclass.constructor.call(this);
    this.hT = "0a";

    
    this.setByBigInteger = function(bigIntegerValue) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(bigIntegerValue);
    };

    
    this.setByInteger = function(intValue) {
        var bi = new BigInteger(String(intValue), 10);
        this.setByBigInteger(bi);
    };

    
    this.setValueHex = function(newHexString) {
        this.hV = newHexString;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params['int'] != "undefined") {
            this.setByInteger(params['int']);
        } else if (typeof params == "number") {
            this.setByInteger(params);
        } else if (typeof params['hex'] != "undefined") {
            this.setValueHex(params['hex']);
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DEREnumerated, KJUR.asn1.ASN1Object);


KJUR.asn1.DERUTF8String = function(params) {
    KJUR.asn1.DERUTF8String.superclass.constructor.call(this, params);
    this.hT = "0c";
};
YAHOO.lang.extend(KJUR.asn1.DERUTF8String, KJUR.asn1.DERAbstractString);


KJUR.asn1.DERNumericString = function(params) {
    KJUR.asn1.DERNumericString.superclass.constructor.call(this, params);
    this.hT = "12";
};
YAHOO.lang.extend(KJUR.asn1.DERNumericString, KJUR.asn1.DERAbstractString);


KJUR.asn1.DERPrintableString = function(params) {
    KJUR.asn1.DERPrintableString.superclass.constructor.call(this, params);
    this.hT = "13";
};
YAHOO.lang.extend(KJUR.asn1.DERPrintableString, KJUR.asn1.DERAbstractString);


KJUR.asn1.DERTeletexString = function(params) {
    KJUR.asn1.DERTeletexString.superclass.constructor.call(this, params);
    this.hT = "14";
};
YAHOO.lang.extend(KJUR.asn1.DERTeletexString, KJUR.asn1.DERAbstractString);


KJUR.asn1.DERIA5String = function(params) {
    KJUR.asn1.DERIA5String.superclass.constructor.call(this, params);
    this.hT = "16";
};
YAHOO.lang.extend(KJUR.asn1.DERIA5String, KJUR.asn1.DERAbstractString);


KJUR.asn1.DERUTCTime = function(params) {
    KJUR.asn1.DERUTCTime.superclass.constructor.call(this, params);
    this.hT = "17";

   
    this.setByDate = function(dateObject) {
        this.hTLV = null;
        this.isModified = true;
        this.date = dateObject;
        this.s = this.formatDate(this.date, 'utc');
        this.hV = stohex(this.s);
    };

    this.getFreshValueHex = function() {
        if (typeof this.date == "undefined" && typeof this.s == "undefined") {
            this.date = new Date();
            this.s = this.formatDate(this.date, 'utc');
            this.hV = stohex(this.s);
        }
        return this.hV;
    };

    if (params !== undefined) {
        if (params.str !== undefined) {
            this.setString(params.str);
        } else if (typeof params == "string" && params.match(/^[0-9]{12}Z$/)) {
            this.setString(params);
        } else if (params.hex !== undefined) {
            this.setStringHex(params.hex);
        } else if (params.date !== undefined) {
            this.setByDate(params.date);
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERUTCTime, KJUR.asn1.DERAbstractTime);


KJUR.asn1.DERGeneralizedTime = function(params) {
    KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this, params);
    this.hT = "18";
    this.withMillis = false;

    
    this.setByDate = function(dateObject) {
        this.hTLV = null;
        this.isModified = true;
        this.date = dateObject;
        this.s = this.formatDate(this.date, 'gen', this.withMillis);
        this.hV = stohex(this.s);
    };

    this.getFreshValueHex = function() {
        if (this.date === undefined && this.s === undefined) {
            this.date = new Date();
            this.s = this.formatDate(this.date, 'gen', this.withMillis);
            this.hV = stohex(this.s);
        }
        return this.hV;
    };

    if (params !== undefined) {
        if (params.str !== undefined) {
            this.setString(params.str);
        } else if (typeof params == "string" && params.match(/^[0-9]{14}Z$/)) {
            this.setString(params);
        } else if (params.hex !== undefined) {
            this.setStringHex(params.hex);
        } else if (params.date !== undefined) {
            this.setByDate(params.date);
        }
        if (params.millis === true) {
            this.withMillis = true;
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERGeneralizedTime, KJUR.asn1.DERAbstractTime);


KJUR.asn1.DERSequence = function(params) {
    KJUR.asn1.DERSequence.superclass.constructor.call(this, params);
    this.hT = "30";
    this.getFreshValueHex = function() {
        var h = '';
        for (var i = 0; i < this.asn1Array.length; i++) {
            var asn1Obj = this.asn1Array[i];
            h += asn1Obj.getEncodedHex();
        }
        this.hV = h;
        return this.hV;
    };
};
YAHOO.lang.extend(KJUR.asn1.DERSequence, KJUR.asn1.DERAbstractStructured);


KJUR.asn1.DERSet = function(params) {
    KJUR.asn1.DERSet.superclass.constructor.call(this, params);
    this.hT = "31";
    this.sortFlag = true; // item shall be sorted only in ASN.1 DER
    this.getFreshValueHex = function() {
        var a = new Array();
        for (var i = 0; i < this.asn1Array.length; i++) {
            var asn1Obj = this.asn1Array[i];
            a.push(asn1Obj.getEncodedHex());
        }
        if (this.sortFlag == true) a.sort();
        this.hV = a.join('');
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params.sortflag != "undefined" &&
            params.sortflag == false)
            this.sortFlag = false;
    }
};
YAHOO.lang.extend(KJUR.asn1.DERSet, KJUR.asn1.DERAbstractStructured);


KJUR.asn1.DERTaggedObject = function(params) {
    KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);
    this.hT = "a0";
    this.hV = '';
    this.isExplicit = true;
    this.asn1Object = null;

    
    this.setASN1Object = function(isExplicitFlag, tagNoHex, asn1Object) {
        this.hT = tagNoHex;
        this.isExplicit = isExplicitFlag;
        this.asn1Object = asn1Object;
        if (this.isExplicit) {
            this.hV = this.asn1Object.getEncodedHex();
            this.hTLV = null;
            this.isModified = true;
        } else {
            this.hV = null;
            this.hTLV = asn1Object.getEncodedHex();
            this.hTLV = this.hTLV.replace(/^../, tagNoHex);
            this.isModified = false;
        }
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params['tag'] != "undefined") {
            this.hT = params['tag'];
        }
        if (typeof params['explicit'] != "undefined") {
            this.isExplicit = params['explicit'];
        }
        if (typeof params['obj'] != "undefined") {
            this.asn1Object = params['obj'];
            this.setASN1Object(this.isExplicit, this.hT, this.asn1Object);
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERTaggedObject, KJUR.asn1.ASN1Object);


var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }


function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this[i++]+w[j]+c;
    c = Math.floor(v/0x4000000);
    w[j++] = v&0x3ffffff;
  }
  return c;
}

function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this[i]&0x7fff;
    var h = this[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}
if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+this.DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm[pm.t-1]);  // normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y); // "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {  // Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);  // Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;


function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;    // y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;  // y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;  // y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff; // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;    // y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)  // pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);



/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var b64map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var b64pad="=";

export function hex2b64(h) {
  var i;
  var c;
  var ret = "";
  for(i = 0; i+3 <= h.length; i+=3) {
    c = parseInt(h.substring(i,i+3),16);
    ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
  }
  if(i+1 == h.length) {
    c = parseInt(h.substring(i,i+1),16);
    ret += b64map.charAt(c << 2);
  }
  else if(i+2 == h.length) {
    c = parseInt(h.substring(i,i+2),16);
    ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
  }
  if (b64pad) while((ret.length & 3) > 0) ret += b64pad;
  return ret;
}

// convert a base64 string to hex
function b64tohex(s) {
  var ret = ""
  var i;
  var k = 0; // b64 state, 0-3
  var slop;
  var v;
  for(i = 0; i < s.length; ++i) {
    if(s.charAt(i) == b64pad) break;
    v = b64map.indexOf(s.charAt(i));
    if(v < 0) continue;
    if(k == 0) {
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 1;
    }
    else if(k == 1) {
      ret += int2char((slop << 2) | (v >> 4));
      slop = v & 0xf;
      k = 2;
    }
    else if(k == 2) {
      ret += int2char(slop);
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 3;
    }
    else {
      ret += int2char((slop << 2) | (v >> 4));
      ret += int2char(v & 0xf);
      k = 0;
    }
  }
  if(k == 1)
    ret += int2char(slop << 2);
  return ret;
}

// convert a base64 string to a byte/number array
function b64toBA(s) {
  //piggyback on b64tohex for now, optimize later
  var h = b64tohex(s);
  var i;
  var a = new Array();
  for(i = 0; 2*i < h.length; ++i) {
    a[i] = parseInt(h.substring(2*i,2*i+2),16);
  }
  return a;
}


/*
-------------------------------------------------------------------------------------------------
 */
function Arcfour() {
  this.i = 0;
  this.j = 0;
  this.S = new Array();
}

// Initialize arcfour context from key, an array of ints, each from [0..255]
function ARC4init(key) {
  var i, j, t;
  for(i = 0; i < 256; ++i)
    this.S[i] = i;
  j = 0;
  for(i = 0; i < 256; ++i) {
    j = (j + this.S[i] + key[i % key.length]) & 255;
    t = this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = t;
  }
  this.i = 0;
  this.j = 0;
}

function ARC4next() {
  var t;
  this.i = (this.i + 1) & 255;
  this.j = (this.j + this.S[this.i]) & 255;
  t = this.S[this.i];
  this.S[this.i] = this.S[this.j];
  this.S[this.j] = t;
  return this.S[(t + this.S[this.i]) & 255];
}

Arcfour.prototype.init = ARC4init;
Arcfour.prototype.next = ARC4next;

// Plug in your RNG constructor here
function prng_newstate() {
  return new Arcfour();
}

// Pool size must be a multiple of 4 and greater than 32.
// An array of bytes the size of the pool will be passed to init()
var rng_psize = 256;

/*
---------------------------------------SecureRandom----------------------------------------------------------
 */
var rng_state;
var rng_pool;
var rng_pptr;

// Mix in a 32-bit integer into the pool
function rng_seed_int(x) {
  rng_pool[rng_pptr++] ^= x & 255;
  rng_pool[rng_pptr++] ^= (x >> 8) & 255;
  rng_pool[rng_pptr++] ^= (x >> 16) & 255;
  rng_pool[rng_pptr++] ^= (x >> 24) & 255;
  if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
}

// Mix in the current time (w/milliseconds) into the pool
function rng_seed_time() {
  rng_seed_int(new Date().getTime());
}

// Initialize the pool with junk if needed.
if (rng_pool == null) {
  rng_pool = new Array();
  rng_pptr = 0;
  var t;
  if (window !== undefined &&
      (window.crypto !== undefined ||
       window.msCrypto !== undefined)) {
    var crypto = window.crypto || window.msCrypto;
    if (crypto.getRandomValues) {
      // Use webcrypto if available
      var ua = new Uint8Array(32);
      crypto.getRandomValues(ua);
      for(t = 0; t < 32; ++t)
        rng_pool[rng_pptr++] = ua[t];
    } else if (navigator.appName == "Netscape" && navigator.appVersion < "5") {
      // Extract entropy (256 bits) from NS4 RNG if available
      var z = window.crypto.random(32);
      for(t = 0; t < z.length; ++t)
        rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
    }
  }  
  while (rng_pptr < rng_psize) {  // extract some randomness from Math.random()
    t = Math.floor(65536 * Math.random());
    rng_pool[rng_pptr++] = t >>> 8;
    rng_pool[rng_pptr++] = t & 255;
  }
  rng_pptr = 0;
  rng_seed_time();
  //rng_seed_int(window.screenX);
  //rng_seed_int(window.screenY);
}

function rng_get_byte() {
  if (rng_state == null) {
    rng_seed_time();
    rng_state = prng_newstate();
    rng_state.init(rng_pool);
    for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
      rng_pool[rng_pptr] = 0;
    rng_pptr = 0;
    //rng_pool = null;
  }
  // TODO: allow reseeding after first request
  return rng_state.next();
}

function rng_get_bytes(ba) {
  var i;
  for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
}

function SecureRandom() {}

SecureRandom.prototype.nextBytes = rng_get_bytes;


/*
---------------------------------------CryptoJS----------------------------------------------------------
 */

var CryptoJS = CryptoJS || (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

           
            init: function () {
            },

            
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    
    var WordArray = C_lib.WordArray = Base.extend({
        
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

       
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

       
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push((Math.random() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });


    var C_enc = C.enc = {};

    
    var Hex = C_enc.Hex = {
        
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

       
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
       
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

   
    var Utf8 = C_enc.Utf8 = {
        
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

       
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

   
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512/32,

        
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

   
    var C_algo = C.algo = {};

    return C;
}(Math));






(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Reusable object
    var W = [];

    /**
     * SHA-1 hash algorithm.
     */
    var SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init([
                0x67452301, 0xefcdab89,
                0x98badcfe, 0x10325476,
                0xc3d2e1f0
            ]);
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];

            // Computation
            for (var i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = (n << 1) | (n >>> 31);
                }

                var t = ((a << 5) | (a >>> 27)) + e + W[i];
                if (i < 20) {
                    t += ((b & c) | (~b & d)) + 0x5a827999;
                } else if (i < 40) {
                    t += (b ^ c ^ d) + 0x6ed9eba1;
                } else if (i < 60) {
                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
                } else /* if (i < 80) */ {
                    t += (b ^ c ^ d) - 0x359d3e2a;
                }

                e = d;
                d = c;
                c = (b << 30) | (b >>> 2);
                b = a;
                a = t;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    C.SHA1 = Hasher._createHelper(SHA1);
    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
}());




(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    C.SHA256 = Hasher._createHelper(SHA256);


    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));


/*

--------------------------------------------------asn1hex-1.1-------------------------------------------------------
*/
var ASN1HEX = new function() {
};

ASN1HEX.getLblen = function(s, idx) {
    if (s.substr(idx + 2, 1) != '8') return 1;
    var i = parseInt(s.substr(idx + 3, 1));
    if (i == 0) return -1;             // length octet '80' indefinite length
    if (0 < i && i < 10) return i + 1; // including '8?' octet;
    return -2;                         // malformed format
};

ASN1HEX.getL = function(s, idx) {
    var len = ASN1HEX.getLblen(s, idx);
    if (len < 1) return '';
    return s.substr(idx + 2, len * 2);
};

ASN1HEX.getVblen = function(s, idx) {
    var hLen, bi;
    hLen = ASN1HEX.getL(s, idx);
    if (hLen == '') return -1;
    if (hLen.substr(0, 1) === '8') {
        bi = new BigInteger(hLen.substr(2), 16);
    } else {
        bi = new BigInteger(hLen, 16);
    }
//  console.log("bi---",bi, BigInteger)
    return bi.intValue();
};


ASN1HEX.getVidx = function(s, idx) {
    var l_len = ASN1HEX.getLblen(s, idx);
    if (l_len < 0) return l_len;
    return idx + (l_len + 1) * 2;
};


ASN1HEX.getV = function(s, idx) {
    var idx1 = ASN1HEX.getVidx(s, idx);
    var blen = ASN1HEX.getVblen(s, idx);
    return s.substr(idx1, blen * 2);
};

ASN1HEX.getTLV = function(s, idx) {
    return s.substr(idx, 2) + ASN1HEX.getL(s, idx) + ASN1HEX.getV(s, idx);
};

// ========== sibling methods ================================

ASN1HEX.getNextSiblingIdx = function(s, idx) {
    var idx1 = ASN1HEX.getVidx(s, idx);
    var blen = ASN1HEX.getVblen(s, idx);
    return idx1 + blen * 2;
};

// ========== children methods ===============================

ASN1HEX.getChildIdx = function(h, pos) {
    var _ASN1HEX = ASN1HEX;
    var a = new Array();
    var p0 = _ASN1HEX.getVidx(h, pos);
    if (h.substr(pos, 2) == "03") {
    a.push(p0 + 2); // BITSTRING value without unusedbits
    } else {
    a.push(p0);
    }

    var blen = _ASN1HEX.getVblen(h, pos);
    var p = p0;
    var k = 0;
    while (1) {
        var pNext = _ASN1HEX.getNextSiblingIdx(h, p);
        if (pNext == null || (pNext - p0  >= (blen * 2))) break;
        if (k >= 200) break;
            
        a.push(pNext);
        p = pNext;
            
        k++;
    }
    
    return a;
};


ASN1HEX.getNthChildIdx = function(h, idx, nth) {
    var a = ASN1HEX.getChildIdx(h, idx);
    return a[nth];
};

// ========== decendant methods ==============================

ASN1HEX.getIdxbyList = function(h, currentIndex, nthList, checkingTag) {
    var _ASN1HEX = ASN1HEX;
    var firstNth, a;
    if (nthList.length == 0) {
    if (checkingTag !== undefined) {
            if (h.substr(currentIndex, 2) !== checkingTag) {
        throw "checking tag doesn't match: " + 
                    h.substr(currentIndex, 2) + "!=" + checkingTag;
            }
    }
        return currentIndex;
    }
    firstNth = nthList.shift();
    a = _ASN1HEX.getChildIdx(h, currentIndex);
    return _ASN1HEX.getIdxbyList(h, a[firstNth], nthList, checkingTag);
};


ASN1HEX.getTLVbyList = function(h, currentIndex, nthList, checkingTag) {
    var _ASN1HEX = ASN1HEX;
    var idx = _ASN1HEX.getIdxbyList(h, currentIndex, nthList);
    if (idx === undefined) {
        throw "can't find nthList object";
    }
    if (checkingTag !== undefined) {
        if (h.substr(idx, 2) != checkingTag) {
            throw "checking tag doesn't match: " + 
                h.substr(idx,2) + "!=" + checkingTag;
        }
    }
    return _ASN1HEX.getTLV(h, idx);
};


ASN1HEX.getVbyList = function(h, currentIndex, nthList, checkingTag, removeUnusedbits) {
    var _ASN1HEX = ASN1HEX;
    var idx, v;
    idx = _ASN1HEX.getIdxbyList(h, currentIndex, nthList, checkingTag);
    
    if (idx === undefined) {
        throw "can't find nthList object";
    }

    v = _ASN1HEX.getV(h, idx);
    if (removeUnusedbits === true) v = v.substr(2);
    return v;
};


ASN1HEX.hextooidstr = function(hex) {
    var zeroPadding = function(s, len) {
        if (s.length >= len) return s;
        return new Array(len - s.length + 1).join('0') + s;
    };

    var a = [];

    // a[0], a[1]
    var hex0 = hex.substr(0, 2);
    var i0 = parseInt(hex0, 16);
    a[0] = new String(Math.floor(i0 / 40));
    a[1] = new String(i0 % 40);

    // a[2]..a[n]
   var hex1 = hex.substr(2);
    var b = [];
    for (var i = 0; i < hex1.length / 2; i++) {
    b.push(parseInt(hex1.substr(i * 2, 2), 16));
    }
    var c = [];
    var cbin = "";
    for (var i = 0; i < b.length; i++) {
        if (b[i] & 0x80) {
            cbin = cbin + zeroPadding((b[i] & 0x7f).toString(2), 7);
        } else {
            cbin = cbin + zeroPadding((b[i] & 0x7f).toString(2), 7);
            c.push(new String(parseInt(cbin, 2)));
            cbin = "";
        }
    }

    var s = a.join(".");
    if (c.length > 0) s = s + "." + c.join(".");
    return s;
};

ASN1HEX.dump = function(hexOrObj, flags, idx, indent) {
    var _ASN1HEX = ASN1HEX;
    var _getV = _ASN1HEX.getV;
    var _dump = _ASN1HEX.dump;
    var _getChildIdx = _ASN1HEX.getChildIdx;

    var hex = hexOrObj;
    if (hexOrObj instanceof KJUR.asn1.ASN1Object)
    hex = hexOrObj.getEncodedHex();

    var _skipLongHex = function(hex, limitNumOctet) {
    if (hex.length <= limitNumOctet * 2) {
        return hex;
    } else {
        var s = hex.substr(0, limitNumOctet) + 
            "..(total " + hex.length / 2 + "bytes).." +
            hex.substr(hex.length - limitNumOctet, limitNumOctet);
        return s;
    };
    };

    if (flags === undefined) flags = { "ommit_long_octet": 32 };
    if (idx === undefined) idx = 0;
    if (indent === undefined) indent = "";
    var skipLongHex = flags.ommit_long_octet;

    if (hex.substr(idx, 2) == "01") {
    var v = _getV(hex, idx);
    if (v == "00") {
        return indent + "BOOLEAN FALSE\n";
    } else {
        return indent + "BOOLEAN TRUE\n";
    }
    }
    if (hex.substr(idx, 2) == "02") {
    var v = _getV(hex, idx);
    return indent + "INTEGER " + _skipLongHex(v, skipLongHex) + "\n";
    }
    if (hex.substr(idx, 2) == "03") {
    var v = _getV(hex, idx);
    return indent + "BITSTRING " + _skipLongHex(v, skipLongHex) + "\n";
    }
    if (hex.substr(idx, 2) == "04") {
    var v = _getV(hex, idx);
    if (_ASN1HEX.isASN1HEX(v)) {
        var s = indent + "OCTETSTRING, encapsulates\n";
        s = s + _dump(v, flags, 0, indent + "  ");
        return s;
    } else {
        return indent + "OCTETSTRING " + _skipLongHex(v, skipLongHex) + "\n";
    }
    }
    if (hex.substr(idx, 2) == "05") {
    return indent + "NULL\n";
    }
    if (hex.substr(idx, 2) == "06") {
    var hV = _getV(hex, idx);
        var oidDot = KJUR.asn1.ASN1Util.oidHexToInt(hV);
        var oidName = KJUR.asn1.x509.OID.oid2name(oidDot);
    var oidSpc = oidDot.replace(/\./g, ' ');
        if (oidName != '') {
        return indent + "ObjectIdentifier " + oidName + " (" + oidSpc + ")\n";
    } else {
        return indent + "ObjectIdentifier (" + oidSpc + ")\n";
    }
    }
    if (hex.substr(idx, 2) == "0c") {
    return indent + "UTF8String '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "13") {
    return indent + "PrintableString '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "14") {
    return indent + "TeletexString '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "16") {
    return indent + "IA5String '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "17") {
    return indent + "UTCTime " + hextoutf8(_getV(hex, idx)) + "\n";
    }
    if (hex.substr(idx, 2) == "18") {
    return indent + "GeneralizedTime " + hextoutf8(_getV(hex, idx)) + "\n";
    }
    if (hex.substr(idx, 2) == "30") {
    if (hex.substr(idx, 4) == "3000") {
        return indent + "SEQUENCE {}\n";
    }

    var s = indent + "SEQUENCE\n";
    var aIdx = _getChildIdx(hex, idx);

    var flagsTemp = flags;
    
    if ((aIdx.length == 2 || aIdx.length == 3) &&
        hex.substr(aIdx[0], 2) == "06" &&
        hex.substr(aIdx[aIdx.length - 1], 2) == "04") { // supposed X.509v3 extension
        var oidName = _ASN1HEX.oidname(_getV(hex, aIdx[0]));
        var flagsClone = JSON.parse(JSON.stringify(flags));
        flagsClone.x509ExtName = oidName;
        flagsTemp = flagsClone;
    }
    
    for (var i = 0; i < aIdx.length; i++) {
        s = s + _dump(hex, flagsTemp, aIdx[i], indent + "  ");
    }
    return s;
    }
    if (hex.substr(idx, 2) == "31") {
    var s = indent + "SET\n";
    var aIdx = _getChildIdx(hex, idx);
    for (var i = 0; i < aIdx.length; i++) {
        s = s + _dump(hex, flags, aIdx[i], indent + "  ");
    }
    return s;
    }
    var tag = parseInt(hex.substr(idx, 2), 16);
    if ((tag & 128) != 0) { // context specific 
    var tagNumber = tag & 31;
    if ((tag & 32) != 0) { // structured tag
        var s = indent + "[" + tagNumber + "]\n";
        var aIdx = _getChildIdx(hex, idx);
        for (var i = 0; i < aIdx.length; i++) {
        s = s + _dump(hex, flags, aIdx[i], indent + "  ");
        }
        return s;
    } else { // primitive tag
        var v = _getV(hex, idx);
        if (v.substr(0, 8) == "68747470") { // http
        v = hextoutf8(v);
        }
        if (flags.x509ExtName === "subjectAltName" &&
        tagNumber == 2) {
        v = hextoutf8(v);
        }
        
        var s = indent + "[" + tagNumber + "] " + v + "\n";
        return s;
    }
    }
    return indent + "UNKNOWN(" + hex.substr(idx, 2) + ") " + 
       _getV(hex, idx) + "\n";
};


ASN1HEX.isASN1HEX = function(hex) {
    var _ASN1HEX = ASN1HEX;
    if (hex.length % 2 == 1) return false;

    var intL = _ASN1HEX.getVblen(hex, 0);
    var tV = hex.substr(0, 2);
    var lV = _ASN1HEX.getL(hex, 0);
    var hVLength = hex.length - tV.length - lV.length;
    if (hVLength == intL * 2) return true;

    return false;
};

ASN1HEX.oidname = function(oidDotOrHex) {
    var _KJUR_asn1 = KJUR.asn1;
    if (KJUR.lang.String.isHex(oidDotOrHex))
    oidDotOrHex = _KJUR_asn1.ASN1Util.oidHexToInt(oidDotOrHex);
    var name = _KJUR_asn1.x509.OID.oid2name(oidDotOrHex);
    if (name === "") name = oidDotOrHex;
    return name;
};


/*

--------------------------------------------------base64x-1.1-------------------------------------------------------
*/
var KJUR;
if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
if (typeof KJUR.lang == "undefined" || !KJUR.lang) KJUR.lang = {};


KJUR.lang.String = function() {};


function Base64x() {
}


function stoBA(s) {
    var a = new Array();
    for (var i = 0; i < s.length; i++) {
    a[i] = s.charCodeAt(i);
    }
    return a;
}


function BAtos(a) {
    var s = "";
    for (var i = 0; i < a.length; i++) {
    s = s + String.fromCharCode(a[i]);
    }
    return s;
}


function BAtohex(a) {
    var s = "";
    for (var i = 0; i < a.length; i++) {
    var hex1 = a[i].toString(16);
    if (hex1.length == 1) hex1 = "0" + hex1;
    s = s + hex1;
    }
    return s;
}


function stohex(s) {
    return BAtohex(stoBA(s));
}

function stob64(s) {
    return hex2b64(stohex(s));
}

function stob64u(s) {
    return b64tob64u(hex2b64(stohex(s)));
}

function b64utos(s) {
    return BAtos(b64toBA(b64utob64(s)));
}

function b64tob64u(s) {
    s = s.replace(/\=/g, "");
    s = s.replace(/\+/g, "-");
    s = s.replace(/\//g, "_");
    return s;
}

function b64utob64(s) {
    if (s.length % 4 == 2) s = s + "==";
    else if (s.length % 4 == 3) s = s + "=";
    s = s.replace(/-/g, "+");
    s = s.replace(/_/g, "/");
    return s;
}

function hextob64u(s) {
    if (s.length % 2 == 1) s = "0" + s;
    return b64tob64u(hex2b64(s));
}

function b64utohex(s) {
    return b64tohex(b64utob64(s));
}

var utf8tob64u, b64utoutf8;

if (typeof Buffer === 'function') {
  utf8tob64u = function (s) {
    return b64tob64u(new Buffer(s, 'utf8').toString('base64'));
  };

  b64utoutf8 = function (s) {
    return new Buffer(b64utob64(s), 'base64').toString('utf8');
  };
} else {
  utf8tob64u = function (s) {
    return hextob64u(uricmptohex(encodeURIComponentAll(s)));
  };

  b64utoutf8 = function (s) {
    return decodeURIComponent(hextouricmp(b64utohex(s)));
  };
}

function utf8tob64(s) {
  return hex2b64(uricmptohex(encodeURIComponentAll(s)));
}

function b64toutf8(s) {
  return decodeURIComponent(hextouricmp(b64tohex(s)));
}

function utf8tohex(s) {
  return uricmptohex(encodeURIComponentAll(s));
}

function hextoutf8(s) {
  return decodeURIComponent(hextouricmp(s));
}

function hextorstr(sHex) {
    var s = "";
    for (var i = 0; i < sHex.length - 1; i += 2) {
        s += String.fromCharCode(parseInt(sHex.substr(i, 2), 16));
    }
    return s;
}

function rstrtohex(s) {
    var result = "";
    for (var i = 0; i < s.length; i++) {
        result += ("0" + s.charCodeAt(i).toString(16)).slice(-2);
    }
    return result;
}

function hextob64(s) {
    return hex2b64(s);
}

function hextob64nl(s) {
    var b64 = hextob64(s);
    var b64nl = b64.replace(/(.{64})/g, "$1\r\n");
    b64nl = b64nl.replace(/\r\n$/, '');
    return b64nl;
}


function b64nltohex(s) {
    var b64 = s.replace(/[^0-9A-Za-z\/+=]*/g, '');
    var hex = b64tohex(b64);
    return hex;
} 

function hextopem(dataHex, pemHeader) {
    var pemBody = hextob64nl(dataHex);
    return "-----BEGIN " + pemHeader + "-----\r\n" + 
        pemBody + 
        "\r\n-----END " + pemHeader + "-----\r\n";
}

function pemtohex(s, sHead) {
    if (s.indexOf("-----BEGIN ") == -1)
        throw "can't find PEM header: " + sHead;

    if (sHead !== undefined) {
        s = s.replace("-----BEGIN " + sHead + "-----", "");
        s = s.replace("-----END " + sHead + "-----", "");
    } else {
        s = s.replace(/-----BEGIN [^-]+-----/, '');
        s = s.replace(/-----END [^-]+-----/, '');
    }
    return b64nltohex(s);
}

function hextoArrayBuffer(hex) {
    if (hex.length % 2 != 0) throw "input is not even length";
    if (hex.match(/^[0-9A-Fa-f]+$/) == null) throw "input is not hexadecimal";

    var buffer = new ArrayBuffer(hex.length / 2);
    var view = new DataView(buffer);

    for (var i = 0; i < hex.length / 2; i++) {
    view.setUint8(i, parseInt(hex.substr(i * 2, 2), 16));
    }

    return buffer;
}

function ArrayBuffertohex(buffer) {
    var hex = "";
    var view = new DataView(buffer);

    for (var i = 0; i < buffer.byteLength; i++) {
    hex += ("00" + view.getUint8(i).toString(16)).slice(-2);
    }

    return hex;
}

function zulutomsec(s) {
    var year, month, day, hour, min, sec, msec, d;
    var sYear, sFrac, sMsec, matchResult;

    matchResult = s.match(/^(\d{2}|\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(|\.\d+)Z$/);

    if (matchResult) {
        sYear = matchResult[1];
    year = parseInt(sYear);
        if (sYear.length === 2) {
        if (50 <= year && year < 100) {
        year = 1900 + year;
        } else if (0 <= year && year < 50) {
        year = 2000 + year;
        }
    }
    month = parseInt(matchResult[2]) - 1;
    day = parseInt(matchResult[3]);
    hour = parseInt(matchResult[4]);
    min = parseInt(matchResult[5]);
    sec = parseInt(matchResult[6]);
    msec = 0;

    sFrac = matchResult[7];
    if (sFrac !== "") {
        sMsec = (sFrac.substr(1) + "00").substr(0, 3); // .12 -> 012
        msec = parseInt(sMsec);
    }
    return Date.UTC(year, month, day, hour, min, sec, msec);
    }
    throw "unsupported zulu format: " + s;
}

function zulutosec(s) {
    var msec = zulutomsec(s);
    return ~~(msec / 1000);
}

function zulutodate(s) {
    return new Date(zulutomsec(s));
}

function datetozulu(d, flagUTCTime, flagMilli) {
    var s;
    var year = d.getUTCFullYear();
    if (flagUTCTime) {
    if (year < 1950 || 2049 < year) 
        throw "not proper year for UTCTime: " + year;
    s = ("" + year).slice(-2);
    } else {
    s = ("000" + year).slice(-4);
    }
    s += ("0" + (d.getUTCMonth() + 1)).slice(-2);
    s += ("0" + d.getUTCDate()).slice(-2);
    s += ("0" + d.getUTCHours()).slice(-2);
    s += ("0" + d.getUTCMinutes()).slice(-2);
    s += ("0" + d.getUTCSeconds()).slice(-2);
    if (flagMilli) {
    var milli = d.getUTCMilliseconds();
    if (milli !== 0) {
        milli = ("00" + milli).slice(-3);
        milli = milli.replace(/0+$/g, "");
        s += "." + milli;
    }
    }
    s += "Z";
    return s;
}

function uricmptohex(s) {
  return s.replace(/%/g, "");
}

function hextouricmp(s) {
  return s.replace(/(..)/g, "%$1");
}

function ipv6tohex(s) {
  var msgMalformedAddress = "malformed IPv6 address";
  if (! s.match(/^[0-9A-Fa-f:]+$/))
    throw msgMalformedAddress;

  // 1. downcase
  s = s.toLowerCase();

  // 2. expand ::
  var num_colon = s.split(':').length - 1;
  if (num_colon < 2) throw msgMalformedAddress;
  var colon_replacer = ':'.repeat(7 - num_colon + 2);
  s = s.replace('::', colon_replacer);

  // 3. fill zero
  var a = s.split(':');
  if (a.length != 8) throw msgMalformedAddress;
  for (var i = 0; i < 8; i++) {
    a[i] = ("0000" + a[i]).slice(-4);
  }
  return a.join('');
}

function hextoipv6(s) {
  if (! s.match(/^[0-9A-Fa-f]{32}$/))
    throw "malformed IPv6 address octet";

  // 1. downcase
  s = s.toLowerCase();

  // 2. split 4
  var a = s.match(/.{1,4}/g);

  // 3. trim leading 0
  for (var i = 0; i < 8; i++) {
    a[i] = a[i].replace(/^0+/, "");
    if (a[i] == '') a[i] = '0';
  }
  s = ":" + a.join(":") + ":";

  // 4. find shrinkables :0:0:...
  var aZero = s.match(/:(0:){2,}/g);

  // 5. no shrinkable
  if (aZero === null) return s.slice(1, -1);

  // 6. find max length :0:0:...
  var item = '';
  for (var i = 0; i < aZero.length; i++) {
    if (aZero[i].length > item.length) item = aZero[i];
  }

  // 7. shrink
  s = s.replace(item, '::');
  return s.slice(1, -1);
}

function hextoip(s) {
  var malformedMsg = "malformed hex value";
  if (! s.match(/^([0-9A-Fa-f][0-9A-Fa-f]){1,}$/))
    throw malformedMsg;
  if (s.length == 8) { // ipv4
    var ip;
    try {
      ip = parseInt(s.substr(0, 2), 16) + "." +
           parseInt(s.substr(2, 2), 16) + "." +
           parseInt(s.substr(4, 2), 16) + "." +
           parseInt(s.substr(6, 2), 16);
      return ip;
    } catch (ex) {
      throw malformedMsg;
    }
  } else if (s.length == 32) {
    return hextoipv6(s);
  } else {
    return s;
  }
}

function iptohex(s) {
  var malformedMsg = "malformed IP address";
  s = s.toLowerCase(s);

  if (s.match(/^[0-9.]+$/)) {
    var a = s.split(".");
    if (a.length !== 4) throw malformedMsg;
    var hex = "";
    try {
      for (var i = 0; i < 4; i++) {
        var d = parseInt(a[i]);
        hex += ("0" + d.toString(16)).slice(-2);
      }
      return hex;
    } catch(ex) {
      throw malformedMsg;
    }
  } else if (s.match(/^[0-9a-f:]+$/) && s.indexOf(":") !== -1) {
    return ipv6tohex(s);
  } else {
    throw malformedMsg;
  }
}

function encodeURIComponentAll(u8) {
  var s = encodeURIComponent(u8);
  var s2 = "";
  for (var i = 0; i < s.length; i++) {
    if (s[i] == "%") {
      s2 = s2 + s.substr(i, 3);
      i = i + 2;
    } else {
      s2 = s2 + "%" + stohex(s[i]);
    }
  }
  return s2;
}

// ==== new lines ================================
function newline_toUnix(s) {
    s = s.replace(/\r\n/mg, "\n");
    return s;
}

function newline_toDos(s) {
    s = s.replace(/\r\n/mg, "\n");
    s = s.replace(/\n/mg, "\r\n");
    return s;
}


KJUR.lang.String.isInteger = function(s) {
    if (s.match(/^[0-9]+$/)) {
    return true;
    } else if (s.match(/^-[0-9]+$/)) {
    return true;
    } else {
    return false;
    }
};

KJUR.lang.String.isHex = function(s) {
    if (s.length % 2 == 0 &&
    (s.match(/^[0-9a-f]+$/) || s.match(/^[0-9A-F]+$/))) {
    return true;
    } else {
    return false;
    }
};

KJUR.lang.String.isBase64 = function(s) {
    s = s.replace(/\s+/g, "");
    if (s.match(/^[0-9A-Za-z+\/]+={0,3}$/) && s.length % 4 == 0) {
    return true;
    } else {
    return false;
    }
};

KJUR.lang.String.isBase64URL = function(s) {
    if (s.match(/[+/=]/)) return false;
    s = b64utob64(s);
    return KJUR.lang.String.isBase64(s);
};

KJUR.lang.String.isIntegerArray = function(s) {
    s = s.replace(/\s+/g, "");
    if (s.match(/^\[[0-9,]+\]$/)) {
    return true;
    } else {
    return false;
    }
};


function hextoposhex(s) {
    if (s.length % 2 == 1) return "0" + s;
    if (s.substr(0, 1) > "7") return "00" + s;
    return s;
}

function intarystrtohex(s) {
  s = s.replace(/^\s*\[\s*/, '');
  s = s.replace(/\s*\]\s*$/, '');
  s = s.replace(/\s*/g, '');
  try {
    var hex = s.split(/,/).map(function(element, index, array) {
      var i = parseInt(element);
      if (i < 0 || 255 < i) throw "integer not in range 0-255";
      var hI = ("00" + i.toString(16)).slice(-2);
      return hI;
    }).join('');
    return hex;
  } catch(ex) {
    throw "malformed integer array string: " + ex;
  }
}

var strdiffidx = function(s1, s2) {
    var n = s1.length;
    if (s1.length > s2.length) n = s2.length;
    for (var i = 0; i < n; i++) {
    if (s1.charCodeAt(i) != s2.charCodeAt(i)) return i;
    }
    if (s1.length != s2.length) return n;
    return -1; // same
};




/*

--------------------------------------------------crypto-1.1-------------------------------------------------------
*/

if (typeof KJUR == "undefined" || !KJUR) KJUR = {};

if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};


KJUR.crypto.Util = new function() {
    this.DIGESTINFOHEAD = {
    'sha1':      "3021300906052b0e03021a05000414",
    'sha224':    "302d300d06096086480165030402040500041c",
    'sha256':    "3031300d060960864801650304020105000420",
    'sha384':    "3041300d060960864801650304020205000430",
    'sha512':    "3051300d060960864801650304020305000440",
    'md2':       "3020300c06082a864886f70d020205000410",
    'md5':       "3020300c06082a864886f70d020505000410",
    'ripemd160': "3021300906052b2403020105000414",
    };

    /*
     * @since crypto 1.1.1
     */
    this.DEFAULTPROVIDER = {
    'md5':          'cryptojs',
    'sha1':         'cryptojs',
    'sha224':       'cryptojs',
    'sha256':       'cryptojs',
    'sha384':       'cryptojs',
    'sha512':       'cryptojs',
    'ripemd160':        'cryptojs',
    'hmacmd5':      'cryptojs',
    'hmacsha1':     'cryptojs',
    'hmacsha224':       'cryptojs',
    'hmacsha256':       'cryptojs',
    'hmacsha384':       'cryptojs',
    'hmacsha512':       'cryptojs',
    'hmacripemd160':    'cryptojs',

    'MD5withRSA':       'cryptojs/jsrsa',
    'SHA1withRSA':      'cryptojs/jsrsa',
    'SHA224withRSA':    'cryptojs/jsrsa',
    'SHA256withRSA':    'cryptojs/jsrsa',
    'SHA384withRSA':    'cryptojs/jsrsa',
    'SHA512withRSA':    'cryptojs/jsrsa',
    'RIPEMD160withRSA': 'cryptojs/jsrsa',

    'MD5withECDSA':     'cryptojs/jsrsa',
    'SHA1withECDSA':    'cryptojs/jsrsa',
    'SHA224withECDSA':  'cryptojs/jsrsa',
    'SHA256withECDSA':  'cryptojs/jsrsa',
    'SHA384withECDSA':  'cryptojs/jsrsa',
    'SHA512withECDSA':  'cryptojs/jsrsa',
    'RIPEMD160withECDSA':   'cryptojs/jsrsa',

    'SHA1withDSA':      'cryptojs/jsrsa',
    'SHA224withDSA':    'cryptojs/jsrsa',
    'SHA256withDSA':    'cryptojs/jsrsa',

    'MD5withRSAandMGF1':        'cryptojs/jsrsa',
    'SHA1withRSAandMGF1':       'cryptojs/jsrsa',
    'SHA224withRSAandMGF1':     'cryptojs/jsrsa',
    'SHA256withRSAandMGF1':     'cryptojs/jsrsa',
    'SHA384withRSAandMGF1':     'cryptojs/jsrsa',
    'SHA512withRSAandMGF1':     'cryptojs/jsrsa',
    'RIPEMD160withRSAandMGF1':  'cryptojs/jsrsa',
    };

    this.CRYPTOJSMESSAGEDIGESTNAME = {
    'md5':      CryptoJS.algo.MD5,
    'sha1':     CryptoJS.algo.SHA1,
    'sha224':   CryptoJS.algo.SHA224,
    'sha256':   CryptoJS.algo.SHA256,
    'sha384':   CryptoJS.algo.SHA384,
    'sha512':   CryptoJS.algo.SHA512,
    'ripemd160':    CryptoJS.algo.RIPEMD160
    };

    this.getDigestInfoHex = function(hHash, alg) {
    if (typeof this.DIGESTINFOHEAD[alg] == "undefined")
        throw "alg not supported in Util.DIGESTINFOHEAD: " + alg;
    return this.DIGESTINFOHEAD[alg] + hHash;
    };

    this.getPaddedDigestInfoHex = function(hHash, alg, keySize) {
    var hDigestInfo = this.getDigestInfoHex(hHash, alg);
    var pmStrLen = keySize / 4; // minimum PM length

    if (hDigestInfo.length + 22 > pmStrLen) // len(0001+ff(*8)+00+hDigestInfo)=22
        throw "key is too short for SigAlg: keylen=" + keySize + "," + alg;

    var hHead = "0001";
    var hTail = "00" + hDigestInfo;
    var hMid = "";
    var fLen = pmStrLen - hHead.length - hTail.length;
    for (var i = 0; i < fLen; i += 2) {
        hMid += "ff";
    }
    var hPaddedMessage = hHead + hMid + hTail;
    return hPaddedMessage;
    };

    this.hashString = function(s, alg) {
        var md = new KJUR.crypto.MessageDigest({'alg': alg});
        return md.digestString(s);
    };

    this.hashHex = function(sHex, alg) {
        var md = new KJUR.crypto.MessageDigest({'alg': alg});
        return md.digestHex(sHex);
    };

    this.sha1 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha1', 'prov':'cryptojs'});
        return md.digestString(s);
    };

    this.sha256 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha256', 'prov':'cryptojs'});
        return md.digestString(s);
    };

    this.sha256Hex = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha256', 'prov':'cryptojs'});
        return md.digestHex(s);
    };

    this.sha512 = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha512', 'prov':'cryptojs'});
        return md.digestString(s);
    };

    this.sha512Hex = function(s) {
        var md = new KJUR.crypto.MessageDigest({'alg':'sha512', 'prov':'cryptojs'});
        return md.digestHex(s);
    };

};

KJUR.crypto.Util.md5 = function(s) {
    var md = new KJUR.crypto.MessageDigest({'alg':'md5', 'prov':'cryptojs'});
    return md.digestString(s);
};

KJUR.crypto.Util.ripemd160 = function(s) {
    var md = new KJUR.crypto.MessageDigest({'alg':'ripemd160', 'prov':'cryptojs'});
    return md.digestString(s);
};

KJUR.crypto.Util.SECURERANDOMGEN = new SecureRandom();

KJUR.crypto.Util.getRandomHexOfNbytes = function(n) {
    var ba = new Array(n);
    KJUR.crypto.Util.SECURERANDOMGEN.nextBytes(ba);
    return BAtohex(ba);
};

KJUR.crypto.Util.getRandomBigIntegerOfNbytes = function(n) {
    return new BigInteger(KJUR.crypto.Util.getRandomHexOfNbytes(n), 16);
};


KJUR.crypto.Util.getRandomHexOfNbits = function(n) {
    var n_remainder = n % 8;
    var n_quotient = (n - n_remainder) / 8;
    var ba = new Array(n_quotient + 1);
    KJUR.crypto.Util.SECURERANDOMGEN.nextBytes(ba);
    ba[0] = (((255 << n_remainder) & 255) ^ 255) & ba[0];
    return BAtohex(ba);
};

KJUR.crypto.Util.getRandomBigIntegerOfNbits = function(n) {
    return new BigInteger(KJUR.crypto.Util.getRandomHexOfNbits(n), 16);
};

KJUR.crypto.Util.getRandomBigIntegerZeroToMax = function(biMax) {
    var bitLenMax = biMax.bitLength();
    while (1) {
    var biRand = KJUR.crypto.Util.getRandomBigIntegerOfNbits(bitLenMax);
    if (biMax.compareTo(biRand) != -1) return biRand;
    }
};

KJUR.crypto.Util.getRandomBigIntegerMinToMax = function(biMin, biMax) {
    var flagCompare = biMin.compareTo(biMax);
    if (flagCompare == 1) throw "biMin is greater than biMax";
    if (flagCompare == 0) return biMin;

    var biDiff = biMax.subtract(biMin);
    var biRand = KJUR.crypto.Util.getRandomBigIntegerZeroToMax(biDiff);
    return biRand.add(biMin);
};

KJUR.crypto.MessageDigest = function(params) {
    var md = null;
    var algName = null;
    var provName = null;

    this.setAlgAndProvider = function(alg, prov) {
    alg = KJUR.crypto.MessageDigest.getCanonicalAlgName(alg);

    if (alg !== null && prov === undefined) prov = KJUR.crypto.Util.DEFAULTPROVIDER[alg];

    // for cryptojs
    if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:'.indexOf(alg) != -1 &&
        prov == 'cryptojs') {
        try {
          console.log('KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[alg]--',KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME, alg, "-----:",CryptoJS)
        this.md = KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[alg].create();
        } catch (ex) {
        throw "setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex;
        }
        this.updateString = function(str) {
        this.md.update(str);
        };
        this.updateHex = function(hex) {
        var wHex = CryptoJS.enc.Hex.parse(hex);
        this.md.update(wHex);
        };
        this.digest = function() {
        var hash = this.md.finalize();
        return hash.toString(CryptoJS.enc.Hex);
        };
        this.digestString = function(str) {
        this.updateString(str);
        return this.digest();
        };
        this.digestHex = function(hex) {
        this.updateHex(hex);
        return this.digest();
        };
    }
    if (':sha256:'.indexOf(alg) != -1 &&
        prov == 'sjcl') {
        try {
        this.md = new sjcl.hash.sha256();
        } catch (ex) {
        throw "setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex;
        }
        this.updateString = function(str) {
        this.md.update(str);
        };
        this.updateHex = function(hex) {
        var baHex = sjcl.codec.hex.toBits(hex);
        this.md.update(baHex);
        };
        this.digest = function() {
        var hash = this.md.finalize();
        return sjcl.codec.hex.fromBits(hash);
        };
        this.digestString = function(str) {
        this.updateString(str);
        return this.digest();
        };
        this.digestHex = function(hex) {
        this.updateHex(hex);
        return this.digest();
        };
    }
    };

    this.updateString = function(str) {
    throw "updateString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    this.updateHex = function(hex) {
    throw "updateHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    this.digest = function() {
    throw "digest() not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    this.digestString = function(str) {
    throw "digestString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    this.digestHex = function(hex) {
    throw "digestHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName;
    };

    if (params !== undefined) {
    if (params['alg'] !== undefined) {
        this.algName = params['alg'];
        if (params['prov'] === undefined)
        this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];
        this.setAlgAndProvider(this.algName, this.provName);
    }
    }
};

KJUR.crypto.MessageDigest.getCanonicalAlgName = function(alg) {
    if (typeof alg === "string") {
    alg = alg.toLowerCase();
    alg = alg.replace(/-/, '');
    }
    return alg;
};

KJUR.crypto.MessageDigest.getHashLength = function(alg) {
    var MD = KJUR.crypto.MessageDigest
    var alg2 = MD.getCanonicalAlgName(alg);
    if (MD.HASHLENGTH[alg2] === undefined)
    throw "not supported algorithm: " + alg;
    return MD.HASHLENGTH[alg2];
};

// described in KJUR.crypto.MessageDigest class (since jsrsasign 6.2.0 crypto 1.1.10)
KJUR.crypto.MessageDigest.HASHLENGTH = {
    'md5':      16,
    'sha1':     20,
    'sha224':       28,
    'sha256':       32,
    'sha384':       48,
    'sha512':       64,
    'ripemd160':    20
};

KJUR.crypto.Mac = function(params) {
    var mac = null;
    var pass = null;
    var algName = null;
    var provName = null;
    var algProv = null;

    this.setAlgAndProvider = function(alg, prov) {
    alg = alg.toLowerCase();

    if (alg == null) alg = "hmacsha1";

    alg = alg.toLowerCase();
        if (alg.substr(0, 4) != "hmac") {
        throw "setAlgAndProvider unsupported HMAC alg: " + alg;
    }

    if (prov === undefined) prov = KJUR.crypto.Util.DEFAULTPROVIDER[alg];
    this.algProv = alg + "/" + prov;

    var hashAlg = alg.substr(4);

    // for cryptojs
    if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:'.indexOf(hashAlg) != -1 &&
        prov == 'cryptojs') {
        try {
        var mdObj = KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[hashAlg];
        this.mac = CryptoJS.algo.HMAC.create(mdObj, this.pass);
        } catch (ex) {
        throw "setAlgAndProvider hash alg set fail hashAlg=" + hashAlg + "/" + ex;
        }
        this.updateString = function(str) {
        this.mac.update(str);
        };
        this.updateHex = function(hex) {
        var wHex = CryptoJS.enc.Hex.parse(hex);
        this.mac.update(wHex);
        };
        this.doFinal = function() {
        var hash = this.mac.finalize();
        return hash.toString(CryptoJS.enc.Hex);
        };
        this.doFinalString = function(str) {
        this.updateString(str);
        return this.doFinal();
        };
        this.doFinalHex = function(hex) {
        this.updateHex(hex);
        return this.doFinal();
        };
    }
    };

    this.updateString = function(str) {
    throw "updateString(str) not supported for this alg/prov: " + this.algProv;
    };

    this.updateHex = function(hex) {
    throw "updateHex(hex) not supported for this alg/prov: " + this.algProv;
    };

    this.doFinal = function() {
    throw "digest() not supported for this alg/prov: " + this.algProv;
    };

    this.doFinalString = function(str) {
    throw "digestString(str) not supported for this alg/prov: " + this.algProv;
    };

    this.doFinalHex = function(hex) {
    throw "digestHex(hex) not supported for this alg/prov: " + this.algProv;
    };

    this.setPassword = function(pass) {

    if (typeof pass == 'string') {
        var hPass = pass;
        if (pass.length % 2 == 1 || ! pass.match(/^[0-9A-Fa-f]+$/)) { // raw str
        hPass = rstrtohex(pass);
        }
        this.pass = CryptoJS.enc.Hex.parse(hPass);
        return;
    }

    if (typeof pass != 'object')
        throw "KJUR.crypto.Mac unsupported password type: " + pass;
    
    var hPass = null;
    if (pass.hex  !== undefined) {
        if (pass.hex.length % 2 != 0 || ! pass.hex.match(/^[0-9A-Fa-f]+$/))
        throw "Mac: wrong hex password: " + pass.hex;
        hPass = pass.hex;
    }
    if (pass.utf8 !== undefined) hPass = utf8tohex(pass.utf8);
    if (pass.rstr !== undefined) hPass = rstrtohex(pass.rstr);
    if (pass.b64  !== undefined) hPass = b64tohex(pass.b64);
    if (pass.b64u !== undefined) hPass = b64utohex(pass.b64u);

    if (hPass == null)
        throw "KJUR.crypto.Mac unsupported password type: " + pass;

    this.pass = CryptoJS.enc.Hex.parse(hPass);
    };

    if (params !== undefined) {
    if (params.pass !== undefined) {
        this.setPassword(params.pass);
    }
    if (params.alg !== undefined) {
        this.algName = params.alg;
        if (params['prov'] === undefined)
        this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];
        this.setAlgAndProvider(this.algName, this.provName);
    }
    }
};

KJUR.crypto.Signature = function(params) {
    var prvKey = null; // RSAKey/KJUR.crypto.{ECDSA,DSA} object for signing
    var pubKey = null; // RSAKey/KJUR.crypto.{ECDSA,DSA} object for verifying

    var md = null; // KJUR.crypto.MessageDigest object
    var sig = null;
    var algName = null;
    var provName = null;
    var algProvName = null;
    var mdAlgName = null;
    var pubkeyAlgName = null;   // rsa,ecdsa,rsaandmgf1(=rsapss)
    var state = null;
    var pssSaltLen = -1;
    var initParams = null;

    var sHashHex = null; // hex hash value for hex
    var hDigestInfo = null;
    var hPaddedDigestInfo = null;
    var hSign = null;

    this._setAlgNames = function() {
    var matchResult = this.algName.match(/^(.+)with(.+)$/);
    if (matchResult) {
        this.mdAlgName = matchResult[1].toLowerCase();
        this.pubkeyAlgName = matchResult[2].toLowerCase();
    }
    };

    this._zeroPaddingOfSignature = function(hex, bitLength) {
    var s = "";
    var nZero = bitLength / 4 - hex.length;
    for (var i = 0; i < nZero; i++) {
        s = s + "0";
    }
    return s + hex;
    };

    this.setAlgAndProvider = function(alg, prov) {
    this._setAlgNames();
    if (prov != 'cryptojs/jsrsa')
        throw "provider not supported: " + prov;

    if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:'.indexOf(this.mdAlgName) != -1) {
        try {
        this.md = new KJUR.crypto.MessageDigest({'alg':this.mdAlgName});
        } catch (ex) {
        throw "setAlgAndProvider hash alg set fail alg=" +
                    this.mdAlgName + "/" + ex;
        }
        
        this.init = function(keyparam, pass) {
        var keyObj = null;
        try {
            if (pass === undefined) {
            keyObj = KEYUTIL.getKey(keyparam);
            } else {
            keyObj = KEYUTIL.getKey(keyparam, pass);
            }
        } catch (ex) {
            throw "init failed:" + ex;
        }

        if (keyObj.isPrivate === true) {
            this.prvKey = keyObj;
            this.state = "SIGN";
        } else if (keyObj.isPublic === true) {
            this.pubKey = keyObj;
            this.state = "VERIFY";
        } else {
            throw "init failed.:" + keyObj;
        }
        };

        this.updateString = function(str) {
        this.md.updateString(str);
        };

        this.updateHex = function(hex) {
        this.md.updateHex(hex);
        };

        this.sign = function() {
        this.sHashHex = this.md.digest();
        if (typeof this.ecprvhex != "undefined" &&
            typeof this.eccurvename != "undefined") {
            var ec = new KJUR.crypto.ECDSA({'curve': this.eccurvename});
            this.hSign = ec.signHex(this.sHashHex, this.ecprvhex);
        } else if (this.prvKey instanceof RSAKey &&
                   this.pubkeyAlgName === "rsaandmgf1") {
            this.hSign = this.prvKey.signWithMessageHashPSS(this.sHashHex,
                                    this.mdAlgName,
                                    this.pssSaltLen);
        } else if (this.prvKey instanceof RSAKey &&
               this.pubkeyAlgName === "rsa") {
            this.hSign = this.prvKey.signWithMessageHash(this.sHashHex,
                                 this.mdAlgName);
        } else if (this.prvKey instanceof KJUR.crypto.ECDSA) {
            this.hSign = this.prvKey.signWithMessageHash(this.sHashHex);
        } else if (this.prvKey instanceof KJUR.crypto.DSA) {
            this.hSign = this.prvKey.signWithMessageHash(this.sHashHex);
        } else {
            throw "Signature: unsupported private key alg: " + this.pubkeyAlgName;
        }
        return this.hSign;
        };
        this.signString = function(str) {
        this.updateString(str);
        return this.sign();
        };
        this.signHex = function(hex) {
        this.updateHex(hex);
        return this.sign();
        };
        this.verify = function(hSigVal) {
            this.sHashHex = this.md.digest();
        if (typeof this.ecpubhex != "undefined" &&
            typeof this.eccurvename != "undefined") {
            var ec = new KJUR.crypto.ECDSA({curve: this.eccurvename});
            return ec.verifyHex(this.sHashHex, hSigVal, this.ecpubhex);
        } else if (this.pubKey instanceof RSAKey &&
               this.pubkeyAlgName === "rsaandmgf1") {
            return this.pubKey.verifyWithMessageHashPSS(this.sHashHex, hSigVal, 
                                this.mdAlgName,
                                this.pssSaltLen);
        } else if (this.pubKey instanceof RSAKey &&
               this.pubkeyAlgName === "rsa") {
            return this.pubKey.verifyWithMessageHash(this.sHashHex, hSigVal);
        } else if (KJUR.crypto.ECDSA !== undefined &&
               this.pubKey instanceof KJUR.crypto.ECDSA) {
            return this.pubKey.verifyWithMessageHash(this.sHashHex, hSigVal);
        } else if (KJUR.crypto.DSA !== undefined &&
               this.pubKey instanceof KJUR.crypto.DSA) {
            return this.pubKey.verifyWithMessageHash(this.sHashHex, hSigVal);
        } else {
            throw "Signature: unsupported public key alg: " + this.pubkeyAlgName;
        }
        };
    }
    };

    this.init = function(key, pass) {
    throw "init(key, pass) not supported for this alg:prov=" +
          this.algProvName;
    };

    this.updateString = function(str) {
    throw "updateString(str) not supported for this alg:prov=" + this.algProvName;
    };

    this.updateHex = function(hex) {
    throw "updateHex(hex) not supported for this alg:prov=" + this.algProvName;
    };

    this.sign = function() {
    throw "sign() not supported for this alg:prov=" + this.algProvName;
    };

    this.signString = function(str) {
    throw "digestString(str) not supported for this alg:prov=" + this.algProvName;
    };

    this.signHex = function(hex) {
    throw "digestHex(hex) not supported for this alg:prov=" + this.algProvName;
    };

    this.verify = function(hSigVal) {
    throw "verify(hSigVal) not supported for this alg:prov=" + this.algProvName;
    };

    this.initParams = params;

    if (params !== undefined) {
    if (params.alg !== undefined) {
        this.algName = params.alg;
        if (params.prov === undefined) {
        this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];
        } else {
        this.provName = params.prov;
        }
        this.algProvName = this.algName + ":" + this.provName;
        this.setAlgAndProvider(this.algName, this.provName);
        this._setAlgNames();
    }

    if (params['psssaltlen'] !== undefined) this.pssSaltLen = params['psssaltlen'];

    if (params.prvkeypem !== undefined) {
        if (params.prvkeypas !== undefined) {
        throw "both prvkeypem and prvkeypas parameters not supported";
        } else {
        try {
            var prvKey = KEYUTIL.getKey(params.prvkeypem);
            this.init(prvKey);
        } catch (ex) {
            throw "fatal error to load pem private key: " + ex;
        }
        }
    }
    }
};

KJUR.crypto.Cipher = function(params) {
};

KJUR.crypto.Cipher.encrypt = function(s, keyObj, algName) {
    if (keyObj instanceof RSAKey && keyObj.isPublic) {
    var algName2 = KJUR.crypto.Cipher.getAlgByKeyAndName(keyObj, algName);
    if (algName2 === "RSA") return keyObj.encrypt(s);
    if (algName2 === "RSAOAEP") return keyObj.encryptOAEP(s, "sha1");

    var a = algName2.match(/^RSAOAEP(\d+)$/);
    if (a !== null) return keyObj.encryptOAEP(s, "sha" + a[1]);

    throw "Cipher.encrypt: unsupported algorithm for RSAKey: " + algName;
    } else {
    throw "Cipher.encrypt: unsupported key or algorithm";
    }
};

KJUR.crypto.Cipher.decrypt = function(hex, keyObj, algName) {
    if (keyObj instanceof RSAKey && keyObj.isPrivate) {
    var algName2 = KJUR.crypto.Cipher.getAlgByKeyAndName(keyObj, algName);
    if (algName2 === "RSA") return keyObj.decrypt(hex);
    if (algName2 === "RSAOAEP") return keyObj.decryptOAEP(hex, "sha1");

    var a = algName2.match(/^RSAOAEP(\d+)$/);
    if (a !== null) return keyObj.decryptOAEP(hex, "sha" + a[1]);

    throw "Cipher.decrypt: unsupported algorithm for RSAKey: " + algName;
    } else {
    throw "Cipher.decrypt: unsupported key or algorithm";
    }
};

KJUR.crypto.Cipher.getAlgByKeyAndName = function(keyObj, algName) {
    if (keyObj instanceof RSAKey) {
    if (":RSA:RSAOAEP:RSAOAEP224:RSAOAEP256:RSAOAEP384:RSAOAEP512:".indexOf(algName) != -1)
        return algName;
    if (algName === null || algName === undefined) return "RSA";
    throw "getAlgByKeyAndName: not supported algorithm name for RSAKey: " + algName;
    }
    throw "getAlgByKeyAndName: not supported algorithm name: " + algName;
}

KJUR.crypto.OID = new function() {
    this.oidhex2name = {
    '2a864886f70d010101': 'rsaEncryption',
    '2a8648ce3d0201': 'ecPublicKey',
    '2a8648ce380401': 'dsa',
    '2a8648ce3d030107': 'secp256r1',
    '2b8104001f': 'secp192k1',
    '2b81040021': 'secp224r1',
    '2b8104000a': 'secp256k1',
    '2b81040023': 'secp521r1',
    '2b81040022': 'secp384r1',
    '2a8648ce380403': 'SHA1withDSA', // 1.2.840.10040.4.3
    '608648016503040301': 'SHA224withDSA', // 2.16.840.1.101.3.4.3.1
    '608648016503040302': 'SHA256withDSA', // 2.16.840.1.101.3.4.3.2
    };
};


/*

--------------------------------------------------rsa-------------------------------------------------------
*/

function parseBigInt(str,r) {
  return new BigInteger(str,r);
}

function linebrk(s,n) {
  var ret = "";
  var i = 0;
  while(i + n < s.length) {
    ret += s.substring(i,i+n) + "\n";
    i += n;
  }
  return ret + s.substring(i,s.length);
}

function byte2Hex(b) {
  if(b < 0x10)
    return "0" + b.toString(16);
  else
    return b.toString(16);
}

// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
function pkcs1pad2(s,n) {
  if(n < s.length + 11) { // TODO: fix for utf-8
    throw "Message too long for RSA";
    return null;
  }
  var ba = new Array();
  var i = s.length - 1;
  while(i >= 0 && n > 0) {
    var c = s.charCodeAt(i--);
    if(c < 128) { // encode using utf-8
      ba[--n] = c;
    }
    else if((c > 127) && (c < 2048)) {
      ba[--n] = (c & 63) | 128;
      ba[--n] = (c >> 6) | 192;
    }
    else {
      ba[--n] = (c & 63) | 128;
      ba[--n] = ((c >> 6) & 63) | 128;
      ba[--n] = (c >> 12) | 224;
    }
  }
  ba[--n] = 0;
  var rng = new SecureRandom();
  var x = new Array();
  while(n > 2) { // random non-zero pad
    x[0] = 0;
    while(x[0] == 0) rng.nextBytes(x);
    ba[--n] = x[0];
  }
  ba[--n] = 2;
  ba[--n] = 0;
  return new BigInteger(ba);
}

// PKCS#1 (OAEP) mask generation function
function oaep_mgf1_arr(seed, len, hash)
{
    var mask = '', i = 0;

    while (mask.length < len)
    {
        mask += hash(String.fromCharCode.apply(String, seed.concat([
                (i & 0xff000000) >> 24,
                (i & 0x00ff0000) >> 16,
                (i & 0x0000ff00) >> 8,
                i & 0x000000ff])));
        i += 1;
    }

    return mask;
}

function oaep_pad(s, n, hash, hashLen) {
    var MD = KJUR.crypto.MessageDigest;
    var Util = KJUR.crypto.Util;
    var algName = null;

    if (!hash) hash = "sha1";

    if (typeof hash === "string") {
        algName = MD.getCanonicalAlgName(hash);
        hashLen = MD.getHashLength(algName);
        hash = function(s) {
            return hextorstr(Util.hashHex(rstrtohex(s), algName));
        };
    }

    if (s.length + 2 * hashLen + 2 > n) {
        throw "Message too long for RSA";
    }

    var PS = '', i;

    for (i = 0; i < n - s.length - 2 * hashLen - 2; i += 1) {
        PS += '\x00';
    }

    var DB = hash('') + PS + '\x01' + s;
    var seed = new Array(hashLen);
    new SecureRandom().nextBytes(seed);
    
    var dbMask = oaep_mgf1_arr(seed, DB.length, hash);
    var maskedDB = [];

    for (i = 0; i < DB.length; i += 1) {
        maskedDB[i] = DB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    var seedMask = oaep_mgf1_arr(maskedDB, seed.length, hash);
    var maskedSeed = [0];

    for (i = 0; i < seed.length; i += 1) {
        maskedSeed[i + 1] = seed[i] ^ seedMask.charCodeAt(i);
    }

    return new BigInteger(maskedSeed.concat(maskedDB));
}

// "empty" RSA key constructor
export  function RSAKey() {
  this.n = null;
  this.e = 0;
  this.d = null;
  this.p = null;
  this.q = null;
  this.dmp1 = null;
  this.dmq1 = null;
  this.coeff = null;
}

// Set the public key fields N and e from hex strings
function RSASetPublic(N, E) {
    this.isPublic = true;
    this.isPrivate = false;
    if (typeof N !== "string") {
    this.n = N;
    this.e = E;
    } else if(N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);
    } else {
    throw "Invalid RSA public key";
    }
}

// Perform raw public operation on "x": return x^e (mod n)
function RSADoPublic(x) {
  return x.modPowInt(this.e, this.n);
}

// Return the PKCS#1 RSA encryption of "text" as an even-length hex string
function RSAEncrypt(text) {
  var m = pkcs1pad2(text,(this.n.bitLength()+7)>>3);
  if(m == null) return null;
  var c = this.doPublic(m);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}

// Return the PKCS#1 OAEP RSA encryption of "text" as an even-length hex string
function RSAEncryptOAEP(text, hash, hashLen) {
  var m = oaep_pad(text, (this.n.bitLength() + 7) >> 3, hash, hashLen);
  if(m == null) return null;
  var c = this.doPublic(m);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}

// protected
RSAKey.prototype.doPublic = RSADoPublic;

// public
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
RSAKey.prototype.encryptOAEP = RSAEncryptOAEP;
//RSAKey.prototype.encrypt_b64 = RSAEncryptB64;

RSAKey.prototype.type = "RSA";




/*

--------------------------------------------------rsapem-1.1-------------------------------------------------------
*/

RSAKey.getPosArrayOfChildrenFromHex = function(hPrivateKey) {
    return ASN1HEX.getChildIdx(hPrivateKey, 0);
};

RSAKey.getHexValueArrayOfChildrenFromHex = function(hPrivateKey) {
    var _ASN1HEX = ASN1HEX;
    var _getV = _ASN1HEX.getV;
    var a = RSAKey.getPosArrayOfChildrenFromHex(hPrivateKey);
    var h_v =  _getV(hPrivateKey, a[0]);
    var h_n =  _getV(hPrivateKey, a[1]);
    var h_e =  _getV(hPrivateKey, a[2]);
    var h_d =  _getV(hPrivateKey, a[3]);
    var h_p =  _getV(hPrivateKey, a[4]);
    var h_q =  _getV(hPrivateKey, a[5]);
    var h_dp = _getV(hPrivateKey, a[6]);
    var h_dq = _getV(hPrivateKey, a[7]);
    var h_co = _getV(hPrivateKey, a[8]);
    var a = new Array();
    a.push(h_v, h_n, h_e, h_d, h_p, h_q, h_dp, h_dq, h_co);
    return a;
};

RSAKey.prototype.readPrivateKeyFromPEMString = function(keyPEM) {
    var keyHex = pemtohex(keyPEM);
    var a = RSAKey.getHexValueArrayOfChildrenFromHex(keyHex);
    this.setPrivateEx(a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8]);
};

RSAKey.prototype.readPKCS5PrvKeyHex = function(h) {
    var a = RSAKey.getHexValueArrayOfChildrenFromHex(h);
    this.setPrivateEx(a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8]);
};

RSAKey.prototype.readPKCS8PrvKeyHex = function(h) {
    var hN, hE, hD, hP, hQ, hDP, hDQ, hCO;
    var _ASN1HEX = ASN1HEX;
    var _getVbyList = _ASN1HEX.getVbyList;

    if (_ASN1HEX.isASN1HEX(h) === false)
    throw "not ASN.1 hex string";

    try {
    hN  = _getVbyList(h, 0, [2, 0, 1], "02");
    hE  = _getVbyList(h, 0, [2, 0, 2], "02");
    hD  = _getVbyList(h, 0, [2, 0, 3], "02");
    hP  = _getVbyList(h, 0, [2, 0, 4], "02");
    hQ  = _getVbyList(h, 0, [2, 0, 5], "02");
    hDP = _getVbyList(h, 0, [2, 0, 6], "02");
    hDQ = _getVbyList(h, 0, [2, 0, 7], "02");
    hCO = _getVbyList(h, 0, [2, 0, 8], "02");
    } catch(ex) {
    throw "malformed PKCS#8 plain RSA private key";
    }

    this.setPrivateEx(hN, hE, hD, hP, hQ, hDP, hDQ, hCO);
};

RSAKey.prototype.readPKCS5PubKeyHex = function(h) {
    var _ASN1HEX = ASN1HEX;
    var _getV = _ASN1HEX.getV;

    if (_ASN1HEX.isASN1HEX(h) === false)
    throw "keyHex is not ASN.1 hex string";
    var aIdx = _ASN1HEX.getChildIdx(h, 0);
    if (aIdx.length !== 2 ||
    h.substr(aIdx[0], 2) !== "02" ||
    h.substr(aIdx[1], 2) !== "02")
    throw "wrong hex for PKCS#5 public key";
    var hN = _getV(h, aIdx[0]);
    var hE = _getV(h, aIdx[1]);
    this.setPublic(hN, hE);
};

RSAKey.prototype.readPKCS8PubKeyHex = function(h) {
    var _ASN1HEX = ASN1HEX;
    if (_ASN1HEX.isASN1HEX(h) === false)
    throw "not ASN.1 hex string";

    // 06092a864886f70d010101: OBJECT IDENTIFIER rsaEncryption (1 2 840 113549 1 1 1)
    if (_ASN1HEX.getTLVbyList(h, 0, [0, 0]) !== "06092a864886f70d010101")
    throw "not PKCS8 RSA public key";

    var p5hex = _ASN1HEX.getTLVbyList(h, 0, [1, 0]);
    this.readPKCS5PubKeyHex(p5hex);
};

RSAKey.prototype.readCertPubKeyHex = function(h, nthPKI) {
    var x, hPub;
    x = new X509();
    x.readCertHex(h);
    hPub = x.getPublicKeyHex();
    this.readPKCS8PubKeyHex(hPub);
};




/*

---------------------------------------------rsasign-1.2------------------------------------------------------------
*/

var _RE_HEXDECONLY = new RegExp("");
_RE_HEXDECONLY.compile("[^0-9a-f]", "gi");

function _rsasign_getHexPaddedDigestInfoForString(s, keySize, hashAlg) {
    var hashFunc = function(s) { return KJUR.crypto.Util.hashString(s, hashAlg); };
    var sHashHex = hashFunc(s);

    return KJUR.crypto.Util.getPaddedDigestInfoHex(sHashHex, hashAlg, keySize);
}

function _zeroPaddingOfSignature(hex, bitLength) {
    var s = "";
    var nZero = bitLength / 4 - hex.length;
    for (var i = 0; i < nZero; i++) {
  s = s + "0";
    }
    return s + hex;
}

RSAKey.prototype.sign = function(s, hashAlg) {
    var hashFunc = function(s) { return KJUR.crypto.Util.hashString(s, hashAlg); };
    var sHashHex = hashFunc(s);

    return this.signWithMessageHash(sHashHex, hashAlg);
};

RSAKey.prototype.signWithMessageHash = function(sHashHex, hashAlg) {
    var hPM = KJUR.crypto.Util.getPaddedDigestInfoHex(sHashHex, hashAlg, this.n.bitLength());
    var biPaddedMessage = parseBigInt(hPM, 16);
    var biSign = this.doPrivate(biPaddedMessage);
    var hexSign = biSign.toString(16);
    return _zeroPaddingOfSignature(hexSign, this.n.bitLength());
}

// PKCS#1 (PSS) mask generation function
function pss_mgf1_str(seed, len, hash) {
    var mask = '', i = 0;

    while (mask.length < len) {
        mask += hextorstr(hash(rstrtohex(seed + String.fromCharCode.apply(String, [
                (i & 0xff000000) >> 24,
                (i & 0x00ff0000) >> 16,
                (i & 0x0000ff00) >> 8,
                i & 0x000000ff]))));
        i += 1;
    }

    return mask;
}

RSAKey.prototype.signPSS = function(s, hashAlg, sLen) {
    var hashFunc = function(sHex) { return KJUR.crypto.Util.hashHex(sHex, hashAlg); } 
    var hHash = hashFunc(rstrtohex(s));

    if (sLen === undefined) sLen = -1;
    return this.signWithMessageHashPSS(hHash, hashAlg, sLen);
};

RSAKey.prototype.signWithMessageHashPSS = function(hHash, hashAlg, sLen) {
    var mHash = hextorstr(hHash);
    var hLen = mHash.length;
    var emBits = this.n.bitLength() - 1;
    var emLen = Math.ceil(emBits / 8);
    var i;
    var hashFunc = function(sHex) { return KJUR.crypto.Util.hashHex(sHex, hashAlg); } 

    if (sLen === -1 || sLen === undefined) {
        sLen = hLen; // same as hash length
    } else if (sLen === -2) {
        sLen = emLen - hLen - 2; // maximum
    } else if (sLen < -2) {
        throw "invalid salt length";
    }

    if (emLen < (hLen + sLen + 2)) {
        throw "data too long";
    }

    var salt = '';

    if (sLen > 0) {
        salt = new Array(sLen);
        new SecureRandom().nextBytes(salt);
        salt = String.fromCharCode.apply(String, salt);
    }

    var H = hextorstr(hashFunc(rstrtohex('\x00\x00\x00\x00\x00\x00\x00\x00' + mHash + salt)));
    var PS = [];

    for (i = 0; i < emLen - sLen - hLen - 2; i += 1) {
        PS[i] = 0x00;
    }

    var DB = String.fromCharCode.apply(String, PS) + '\x01' + salt;
    var dbMask = pss_mgf1_str(H, DB.length, hashFunc);
    var maskedDB = [];

    for (i = 0; i < DB.length; i += 1) {
        maskedDB[i] = DB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    var mask = (0xff00 >> (8 * emLen - emBits)) & 0xff;
    maskedDB[0] &= ~mask;

    for (i = 0; i < hLen; i++) {
        maskedDB.push(H.charCodeAt(i));
    }

    maskedDB.push(0xbc);

    return _zeroPaddingOfSignature(this.doPrivate(new BigInteger(maskedDB)).toString(16),
           this.n.bitLength());
}

function _rsasign_getDecryptSignatureBI(biSig, hN, hE) {
    var rsa = new RSAKey();
    rsa.setPublic(hN, hE);
    var biDecryptedSig = rsa.doPublic(biSig);
    return biDecryptedSig;
}

function _rsasign_getHexDigestInfoFromSig(biSig, hN, hE) {
    var biDecryptedSig = _rsasign_getDecryptSignatureBI(biSig, hN, hE);
    var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
    return hDigestInfo;
}

function _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo) {
    for (var algName in KJUR.crypto.Util.DIGESTINFOHEAD) {
  var head = KJUR.crypto.Util.DIGESTINFOHEAD[algName];
  var len = head.length;
  if (hDigestInfo.substring(0, len) == head) {
      var a = [algName, hDigestInfo.substring(len)];
      return a;
  }
    }
    return [];
}

RSAKey.prototype.verify = function(sMsg, hSig) {
    hSig = hSig.replace(_RE_HEXDECONLY, '');
    hSig = hSig.replace(/[ \n]+/g, "");
    var biSig = parseBigInt(hSig, 16);
    if (biSig.bitLength() > this.n.bitLength()) return 0;
    var biDecryptedSig = this.doPublic(biSig);
    var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
    var digestInfoAry = _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo);
  
    if (digestInfoAry.length == 0) return false;
    var algName = digestInfoAry[0];
    var diHashValue = digestInfoAry[1];
    var ff = function(s) { return KJUR.crypto.Util.hashString(s, algName); };
    var msgHashValue = ff(sMsg);
    return (diHashValue == msgHashValue);
};

RSAKey.prototype.verifyWithMessageHash = function(sHashHex, hSig) {
    hSig = hSig.replace(_RE_HEXDECONLY, '');
    hSig = hSig.replace(/[ \n]+/g, "");
    var biSig = parseBigInt(hSig, 16);
    if (biSig.bitLength() > this.n.bitLength()) return 0;
    var biDecryptedSig = this.doPublic(biSig);
    var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
    var digestInfoAry = _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo);
  
    if (digestInfoAry.length == 0) return false;
    var algName = digestInfoAry[0];
    var diHashValue = digestInfoAry[1];
    return (diHashValue == sHashHex);
};

RSAKey.prototype.verifyPSS = function(sMsg, hSig, hashAlg, sLen) {
    var hashFunc = function(sHex) { return KJUR.crypto.Util.hashHex(sHex, hashAlg); };
    var hHash = hashFunc(rstrtohex(sMsg));

    if (sLen === undefined) sLen = -1;
    return this.verifyWithMessageHashPSS(hHash, hSig, hashAlg, sLen);
}

RSAKey.prototype.verifyWithMessageHashPSS = function(hHash, hSig, hashAlg, sLen) {
    var biSig = new BigInteger(hSig, 16);

    if (biSig.bitLength() > this.n.bitLength()) {
        return false;
    }

    var hashFunc = function(sHex) { return KJUR.crypto.Util.hashHex(sHex, hashAlg); };
    var mHash = hextorstr(hHash);
    var hLen = mHash.length;
    var emBits = this.n.bitLength() - 1;
    var emLen = Math.ceil(emBits / 8);
    var i;

    if (sLen === -1 || sLen === undefined) {
        sLen = hLen; // same as hash length
    } else if (sLen === -2) {
        sLen = emLen - hLen - 2; // recover
    } else if (sLen < -2) {
        throw "invalid salt length";
    }

    if (emLen < (hLen + sLen + 2)) {
        throw "data too long";
    }

    var em = this.doPublic(biSig).toByteArray();

    for (i = 0; i < em.length; i += 1) {
        em[i] &= 0xff;
    }

    while (em.length < emLen) {
        em.unshift(0);
    }

    if (em[emLen -1] !== 0xbc) {
        throw "encoded message does not end in 0xbc";
    }

    em = String.fromCharCode.apply(String, em);

    var maskedDB = em.substr(0, emLen - hLen - 1);
    var H = em.substr(maskedDB.length, hLen);

    var mask = (0xff00 >> (8 * emLen - emBits)) & 0xff;

    if ((maskedDB.charCodeAt(0) & mask) !== 0) {
        throw "bits beyond keysize not zero";
    }

    var dbMask = pss_mgf1_str(H, maskedDB.length, hashFunc);
    var DB = [];

    for (i = 0; i < maskedDB.length; i += 1) {
        DB[i] = maskedDB.charCodeAt(i) ^ dbMask.charCodeAt(i);
    }

    DB[0] &= ~mask;

    var checkLen = emLen - hLen - sLen - 2;

    for (i = 0; i < checkLen; i += 1) {
        if (DB[i] !== 0x00) {
            throw "leftmost octets not zero";
        }
    }

    if (DB[checkLen] !== 0x01) {
        throw "0x01 marker not found";
    }

    return H === hextorstr(hashFunc(rstrtohex('\x00\x00\x00\x00\x00\x00\x00\x00' + mHash +
             String.fromCharCode.apply(String, DB.slice(-sLen)))));
}

RSAKey.SALT_LEN_HLEN = -1;
RSAKey.SALT_LEN_MAX = -2;
RSAKey.SALT_LEN_RECOVER = -2;


