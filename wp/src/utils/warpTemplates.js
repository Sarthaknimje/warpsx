const stakingTemplate = {
  "protocol": "0.5.0",
  "name": "EGLD Staking",
  "title": "Stake EGLD with a Validator",
  "description": "Stake your EGLD to earn rewards and support the MultiversX network",
  "preview": "https://media.multiversx.com/tokens/staking.png",
  "actions": [
    {
      "type": "sc-call",
      "name": "stake",
      "title": "Stake EGLD",
      "description": "Delegate your EGLD to a validator to earn staking rewards",
      "gasLimit": 12000000,
      "value": "1",
      "destination": "erd1qqqqqqqqqqqqqpgqqz6vp7vs3p7u8t8gxppjq8qwkx7urj4g7a3s69j92r",
      "function": "delegate",
      "arguments": [],
      "payments": [],
      "upgrades": [],
      "fields": [
        {
          "name": "Amount",
          "type": "numeric",
          "value": "1",
          "target": "value",
          "description": "Amount to stake in EGLD",
          "required": true,
          "min": "0.1"
        },
        {
          "name": "Validator",
          "type": "address",
          "value": "erd1qqqqqqqqqqqqqpgqd9rvv2n378e27jcts8vfwynpkm8ng7g7945s2ey76d",
          "target": "arguments.0",
          "description": "Validator address",
          "required": true
        }
      ]
    }
  ],
  "meta": {
    "hash": "",
    "creator": "system",
    "createdAt": ""
  }
};

// Export the templates
module.exports = {
  stakingTemplate
}; 