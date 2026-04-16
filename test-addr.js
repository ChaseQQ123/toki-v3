const text = "北京朝阳区";
const result = text.replace(/[\u4e00-\u9fa5]+[省市区县路街号]/g, "[地址]");
console.log("测试:", result);
console.log(result.includes("[地址]") ? "✅ 通过" : "❌ 失败");
