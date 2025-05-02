export type Language = "en" | "zh";

export const translations = {
  en: {
    save: "Save",
    reset: "Reset",
    expand: "Expand",
    cancel: "Cancel",
    confirm: "Confirm",
    expandExplanation: "expand explanation",
    startGame: "Start Game",
    restartGame: "Restart Game",
    yesRestartGame: "Yes, restart the game",
    notRestartGame: "No, do not restart game",
    gameStarted: "Game started! ",
    confirmdo: "Are you sure to do this?",
    create: "Create",
    word: "Word",
    description: "Description (Optional)",
    undo: "Undo",
    dragHint: "Drag the item to a region in the Venn diagram",
    correct: "Correct! Continue your turn.",
    incorrect: "Incorrect. Draw a new card and pass your turn.",
    correctArea: "The correct area is:",
    attribute: "Attribute",
    context: "Context",
    wordFeature: "Word Feature",
    inputWord: "Please input a word",
    createSuccess: "Item created successfully",
    gameRestarted: "Game restarted!",
    settings: "Settings",
    llmConfig: "LLM Configuration",
    configureLLM: "Configure LLM",
    configureLLMFirst: "Please configure LLM settings first",
    ItemsListDescription:
      "(The ✅❌ displayed in the list are the true attributes of the items, and the red and green background indicates the correctness of the user's response.)",
    noItemsAdded: "No items added yet",
    ItemsList: "Items List",
    showGeneratedAttributes: "Show LLM generated attributes",
    generatedAttributes: "LLM generated attributes",
    noAttributesSelected: "No attributes selected",
    noNameSelected: "No name selected",
    loading: "Loading...",
    llmGenerating: "Generating...",
    noExplanation: "No explanation returned by the model",
    startGameDescription: `_Thing in Rings_ is a game for multiple players and one God. 

The core mechanic revolves around a three-zone Venn diagram. At the start, the God randomly selects attributes for each zone of the Venn diagram, these attributes remain hidden from players: 
- **Attribute**: represents subjective qualities of objects
- **Context**: represents objective qualities
- **Word**: represents characteristics of the object's English name

Each player holds a set of private items unseen by others. Each turn, a player places one item into a zone of the Venn diagram (or outside it, representing None). The God judges whether the item matches the zone's attributes:
- If correct: the player continues their turn (may place another item)
- If incorrect: the player draws a random item, which the God then places in the correct zone, and the turn passes to the next player

The winning condition is being the first to play all cards from one's hand.`,
    announcement: `This website does not provide the full game functionality, but instead uses AI to act as the "God," handling the initial setup of zone attributes and judging whether played cards are correct. You will still need to prepare physical item cards for your friends to play with. `,
  },
  zh: {
    save: "保存",
    reset: "重置",
    expand: "展开",
    expandExplanation: "展开解释",
    startGame: "开始游戏",
    restartGame: "重新开始",
    yesRestartGame: "是的，重新开始",
    notRestartGame: "点错了",
    confirm: "确认",
    confirmdo: "您确定要执行此操作吗？",
    cancel: "取消",
    gameStarted: "游戏开始！",
    create: "创建",
    word: "单词",
    description: "描述（可选）",
    undo: "撤销",
    dragHint: "将物品拖动到 venn 图中的区域",
    correct: "正确！继续你的回合。",
    incorrect: "错误。抽一张新卡并结束回合。",
    correctArea: "正确的区域是：",
    attribute: "主观属性",
    context: "客观属性",
    wordFeature: "单词特征",
    inputWord: "请输入单词",
    createSuccess: "物品创建成功",
    gameRestarted: "游戏已重新开始！",
    settings: "设置",
    llmConfig: "LLM 配置",
    configureLLM: "配置 LLM",
    configureLLMFirst: "请先完成 LLM 配置",
    noItemsAdded: "还没有添加物品",
    ItemsList: "物品列表",
    noAttributesSelected: "没有选择属性",
    noNameSelected: "没有指定名称",
    loading: "加载中...",
    llmGenerating: "生成中...",
    noExplanation: "模型没有返回解释",
    showGeneratedAttributes: "显示模型生成的预设属性",
    ItemsListDescription: "（列表中显示的✅❌是物品的真实属性，背景的红色和绿色指示了用户回答的正确性）",
    generatedAttributes: "模型生成的预设属性",
    startGameDescription: `_Thing in Rings_ 是一款多人加一位"上帝"参与的桌游。

游戏核心机制围绕三连通 venn 图展开。开局时，"上帝"会为 venn 图的每个区域随机选定属性，这些属性对玩家保密：
- **Attribute**（属性）：代表物品的主观特性
- **Context**（语境）：代表物品的客观特性
- **Word**（词汇）：代表物品英文单词的特征


每位玩家持有一组其他玩家不可见的物品。每回合，玩家将一个物品放入 venn 图的某个区域（包括图外，代表 None）。"上帝"会判断该物品是否符合该区域的属性：
- 若符合：该玩家继续回合（可再放置物品）；
- 若不符合：玩家抽取一张随机物品，"上帝"会将该物品放入正确区域，并移交回合给下一位玩家。

胜利条件是率先打空手牌的玩家获胜。`,
    announcement: `该网站并不提供完整的游戏功能，而是由 AI 担任“上帝”的角色，负责开局区域属性的设置以及出牌正确性的判断。你仍然需要为朋友们准备好实体物品卡以供游戏使用。`,
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
