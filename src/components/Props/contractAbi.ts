export const contractAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "CannotReferSelf",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "ERC1967InvalidImplementation",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC1967NonPayable",
    type: "error",
  },
  {
    inputs: [],
    name: "ERR_RankExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedCall",
    type: "error",
  },
  {
    inputs: [],
    name: "ITC_AutomationAdd",
    type: "error",
  },
  {
    inputs: [],
    name: "ITC_OnlyARBAdmin",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "provided",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "required",
        type: "uint256",
      },
    ],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "paramName",
        type: "string",
      },
    ],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRank",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidReferrer",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidUpgrade",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [],
    name: "NothingToClaim",
    type: "error",
  },
  {
    inputs: [],
    name: "OprtrCntRgstr",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "TranAdmnfld",
    type: "error",
  },
  {
    inputs: [],
    name: "TranfldLTG",
    type: "error",
  },
  {
    inputs: [],
    name: "TransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "TrnConFld",
    type: "error",
  },
  {
    inputs: [],
    name: "UUPSUnauthorizedCallContext",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "slot",
        type: "bytes32",
      },
    ],
    name: "UUPSUnsupportedProxiableUUID",
    type: "error",
  },
  {
    inputs: [],
    name: "UserNotActive",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "txType",
        type: "string",
      },
    ],
    name: "ArbPoolUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "level",
        type: "uint8",
      },
    ],
    name: "LvlIncmDstrbtd",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "monthIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "MonthlyPoolUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "itcPerUSD",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdPerITC",
        type: "uint256",
      },
    ],
    name: "PriceITCUSDT",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "monthIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RabShrDstrbtd",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cumulativePrice",
        type: "uint256",
      },
    ],
    name: "RankDetailsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "RankLTGAccumulated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "RankLTGDistributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "usdPrice",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "itcPrice",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "TtlCstITC",
        type: "uint256",
      },
    ],
    name: "RankPrice",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "adminFee",
        type: "uint256",
      },
    ],
    name: "RankUpgrade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "baseCost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "adminFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "RgstrdnRnkPrchsd",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "refferal",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "updateTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newexpiryTime",
        type: "uint256",
      },
    ],
    name: "RnkRnwdByRffrl",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "AdmnWallt",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MONTH_DURATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PRCHS_FEE",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "RANK_VALIDITY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WITHDRAWAL_FEE",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ZERO_ADDRESS",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "arbAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "arbPool",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "automatedMonthlyRabDistribution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "automationAdd",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "_currentRank",
        type: "uint8",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "_targetRank",
        type: "uint8",
      },
    ],
    name: "calculateUpgradeCost",
    outputs: [
      {
        internalType: "uint256",
        name: "baseCostITC",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "AdmnFeeAmt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "itcPerUSDT",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimMonthlyRab",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "currentMonthIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getITCTokenPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "itcPerUSDT",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "usdtPerITC",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMnthlyRABPoolBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "_rank",
        type: "uint8",
      },
    ],
    name: "getRankDetails",
    outputs: [
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cumulativePrice",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
    ],
    name: "getRankLTG",
    outputs: [
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "pendingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ttlDstrbtdAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "_rank",
        type: "uint8",
      },
    ],
    name: "getRankPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "usdPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "itcPerUSDT",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseCostITC",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "AdmnFeeAmt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "TtlCstITC",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
    ],
    name: "getRemainingPayouts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTtlInvstmnt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTtlLtgDstrbtd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTtlRabDstrbtd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTtllvlDstrbtd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "distributor",
        type: "address",
      },
    ],
    name: "getUplines",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserInptTxn",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "enum ITCCommunityUpgradeableV1.Rank",
            name: "rank",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "ttlamt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "ts",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "tp",
            type: "string",
          },
        ],
        internalType: "struct ITCCommunityUpgradeableV1.inputTx[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserRank",
    outputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "rank",
        type: "uint8",
      },
    ],
    name: "getUserReferralRankCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserReferrals",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserTtlInvstmnt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserWthdrlTxn",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "ttlamt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "ts",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "tp",
            type: "string",
          },
        ],
        internalType: "struct ITCCommunityUpgradeableV1.wthdrlTx[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUsrTtlLtgrcvd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUsrTtllvlrcvd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUsrTtlrabrcvd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getWthlvlIncm",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getWthrabIncome",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_itcToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_AdmnWallt",
        type: "address",
      },
      {
        internalType: "address",
        name: "_operatorAdd",
        type: "address",
      },
      {
        internalType: "address",
        name: "_initialOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_automationAdd",
        type: "address",
      },
      {
        internalType: "address",
        name: "_arbAdmin",
        type: "address",
      },
      {
        internalType: "address",
        name: "_poolAdd",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "itcToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    name: "maxPyts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "monthlyEligibleAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "monthlyEligibleUsers",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "monthlyRabPools",
    outputs: [
      {
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "distributionTimestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "operatorAdd",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pool",
    outputs: [
      {
        internalType: "contract IPancakeSwapV3Pool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    name: "rUC",
    outputs: [
      {
        internalType: "uint128",
        name: "cnt",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    name: "rabShrPrsntg",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rabStartTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    name: "rankAchievements",
    outputs: [
      {
        internalType: "uint256",
        name: "achievedTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "payoutsReceived",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isEligible",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    name: "rankDetails",
    outputs: [
      {
        internalType: "uint64",
        name: "price",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "cumulativePrice",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "ltgb",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "cummltv25",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "cummltv5",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "rank2per",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_referrer",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "_rank",
        type: "uint8",
      },
    ],
    name: "registerAndPurchaseRank",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "_rank",
        type: "uint8",
      },
      {
        internalType: "uint64",
        name: "_price",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "_cumulativePrice",
        type: "uint64",
      },
    ],
    name: "updateRankDetails",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "_targetRank",
        type: "uint8",
      },
    ],
    name: "upgradeRank",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    name: "userRankDurations",
    outputs: [
      {
        internalType: "uint256",
        name: "startMonth",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remainingPayouts",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "",
        type: "uint8",
      },
    ],
    name: "userRankLTGBonuses",
    outputs: [
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "pendingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ttlDstrbtdAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "users",
    outputs: [
      {
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        internalType: "enum ITCCommunityUpgradeableV1.Rank",
        name: "currentRank",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "lastRankUpdateTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rankExpiryTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "userTotalInvestment",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "WthlvlIncm",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "TtllvlIncmrcvd",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "TtlLtgrcvd",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "WthrabIncome",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "TtlrabIncmrcvd",
            type: "uint256",
          },
        ],
        internalType: "struct ITCCommunityUpgradeableV1.RwdInfo",
        name: "rewards",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "usrCnt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawARBPoolBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawLevelIncome",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default contractAbi;
