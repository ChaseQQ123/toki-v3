// Token 计费系统 - TOKNM平台
// 系统起步配置1000万免费token，超过后按港币计费

import { TOKEN_PACKAGES, BILLING_CONFIG } from '../utils/constants';

export interface UserBalance {
  total: number;
  used: number;
  remaining: number;
  package: typeof TOKEN_PACKAGES[0];
  currency: 'HKD' | 'USD' | 'CNY';
  prepaidBalance: number;  // 预存余额（港币）
}

export class TokenBilling_v2 {
  private balance: UserBalance = {
    total: BILLING_CONFIG.freeQuota,  // 1000万免费额度
    used: 0,
    remaining: BILLING_CONFIG.freeQuota,
    package: TOKEN_PACKAGES[0],  // 默认免费版
    currency: 'HKD',
    prepaidBalance: 0
  };

  constructor() {
    this.loadBalance();
  }

  // 加载余额
  private loadBalance() {
    const saved = localStorage?.getItem('toknm_token_balance');
    if (saved) {
      this.balance = JSON.parse(saved);
    }
  }

  // 保存余额
  private saveBalance() {
    localStorage?.setItem('toknm_token_balance', JSON.stringify(this.balance));
  }

  // 计算Token数量（精确版）
  estimateTokens(text: string): number {
    // 精确估算：中文1字≈2tokens，英文1词≈1token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    return chineseChars * 2 + englishWords;
  }

  // 消费Token
  consumeTokens(tokens: number): boolean {
    // 如果还有免费额度
    if (this.balance.remaining > 0) {
      if (this.balance.remaining >= tokens) {
        this.balance.used += tokens;
        this.balance.remaining -= tokens;
        this.saveBalance();
        console.log(`💰 消费 ${tokens} tokens（免费额度），剩余 ${this.balance.remaining}`);
        return true;
      }
    }

    // 超过免费额度，使用预存港币
    if (this.balance.prepaidBalance > 0) {
      const costHKD = tokens / BILLING_CONFIG.standardRate;  // 转换为港币
      if (this.balance.prepaidBalance >= costHKD) {
        this.balance.used += tokens;
        this.balance.prepaidBalance -= costHKD;
        this.saveBalance();
        console.log(`💰 消费 ${tokens} tokens（预存港币），花费 HKD ${costHKD.toFixed(2)}，剩余 HKD ${this.balance.prepaidBalance.toFixed(2)}`);
        return true;
      }
    }

    // 余额不足
    console.log('❌ Token余额不足，请充值或购买套餐');
    return false;
  }

  // 退还Token
  refundTokens(tokens: number) {
    this.balance.used -= tokens;
    
    // 如果是免费额度内的退还
    if (this.balance.used < BILLING_CONFIG.freeQuota) {
      this.balance.remaining = BILLING_CONFIG.freeQuota - this.balance.used;
    }
    
    this.saveBalance();
    console.log(`💰 退还 ${tokens} tokens，剩余 ${this.balance.remaining}`);
  }

  // 预存港币
  depositHKD(amount: number) {
    this.balance.prepaidBalance += amount;
    this.saveBalance();
    console.log(`✅ 预存 HKD ${amount}，当前预存余额 HKD ${this.balance.prepaidBalance}`);
    
    // 换算为可用Token
    const additionalTokens = amount * BILLING_CONFIG.standardRate;
    console.log(`   可用Token增加 ${additionalTokens}`);
  }

  // 购买套餐
  purchasePackage(packageId: string): boolean {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      console.log('❌ 套餐不存在');
      return false;
    }

    // 免费套餐
    if (pkg.id === 'free') {
      this.balance.total = BILLING_CONFIG.freeQuota;
      this.balance.remaining = BILLING_CONFIG.freeQuota - this.balance.used;
      this.balance.package = pkg;
      this.saveBalance();
      console.log(`✅ 重置为免费套餐: ${pkg.tokens / 1_000_000}万token`);
      return true;
    }

    // 按量付费
    if (pkg.id === 'payg') {
      this.balance.package = pkg;
      this.saveBalance();
      console.log(`✅ 切换为按量付费模式`);
      return true;
    }

    // 标准套餐（99港币5000万token）
    if (pkg.id === 'standard') {
      this.balance.total += pkg.tokens;
      this.balance.remaining += pkg.tokens;
      this.balance.package = pkg;
      this.saveBalance();
      console.log(`✅ 购买成功: ${pkg.name} - ${pkg.tokens / 1_000_000}万token (HKD ${pkg.price})`);
      return true;
    }

    // 尊享套餐（199港币12000万token两个月）
    if (pkg.id === 'premium') {
      this.balance.total += pkg.tokens;
      this.balance.remaining += pkg.tokens;
      this.balance.package = pkg;
      
      // 设置到期时间（两个月后）
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 2);
      localStorage?.setItem('toknm_package_expiry', expiryDate.toISOString());
      
      this.saveBalance();
      console.log(`✅ 购买成功: ${pkg.name} - ${pkg.tokens / 1_000_000}万token (HKD ${pkg.price}/两个月)`);
      console.log(`   有效期至: ${expiryDate.toLocaleDateString()}`);
      return true;
    }

    return false;
  }

  // 检查余额是否充足
  hasEnoughTokens(required: number): boolean {
    // 免费额度
    if (this.balance.remaining >= required) return true;
    
    // 预存港币
    const costHKD = required / BILLING_CONFIG.standardRate;
    if (this.balance.prepaidBalance >= costHKD) return true;
    
    return false;
  }

  // 获取余额
  getBalance(): UserBalance {
    return this.balance;
  }

  // 获取使用统计
  getUsageStats() {
    const freeQuotaPercentage = (this.balance.used / BILLING_CONFIG.freeQuota * 100).toFixed(1);
    
    return {
      total: this.balance.total,
      used: this.balance.used,
      remaining: this.balance.remaining,
      freeQuotaUsage: `${freeQuotaPercentage}%`,
      package: this.balance.package,
      prepaidHKD: this.balance.prepaidBalance,
      prepaidTokens: this.balance.prepaidBalance * BILLING_CONFIG.standardRate
    };
  }

  // 检查套餐是否到期
  checkPackageExpiry(): boolean {
    const expiry = localStorage?.getItem('toknm_package_expiry');
    if (!expiry) return true;  // 无到期限制
    
    const expiryDate = new Date(expiry);
    const now = new Date();
    
    if (now > expiryDate) {
      console.log('⚠️ 套餐已到期，请续费');
      return false;
    }
    
    return true;
  }

  // 重置（用于测试）
  reset() {
    this.balance = {
      total: BILLING_CONFIG.freeQuota,
      used: 0,
      remaining: BILLING_CONFIG.freeQuota,
      package: TOKEN_PACKAGES[0],
      currency: 'HKD',
      prepaidBalance: 0
    };
    localStorage?.removeItem('toknm_package_expiry');
    this.saveBalance();
    console.log('🔄 Token余额已重置为1000万免费额度');
  }
}

export default new TokenBilling_v2();