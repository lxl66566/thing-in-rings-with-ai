export type Language = 'en' | 'zh';

export const translations = {
  en: {
    announcement: `This website does not provide the full game functionality, but instead uses AI to act as the "Referee," handling the initial setup of zone attributes and judging whether played cards are correct. You will still need to prepare physical item cards for your friends to play with. `,
    attribute: 'Attribute',
    cancel: 'Cancel',
    configureLLM: 'Configure LLM',
    configureLLMFirst: 'Please configure LLM settings first',
    confirm: 'Confirm',
    confirmdo: 'Are you sure to do this?',
    context: 'Context',
    correct: 'Correct! Continue your turn.',
    correctArea: 'The correct area is:',
    create: 'Create',
    createSuccess: 'Item created successfully',
    custom: 'Custom',
    description: 'Description (Optional)',
    dragHint: 'Drag the item to a region in the Venn diagram',
    expand: 'Expand',
    expandExplanation: 'expand explanation',
    gameRestarted: 'Game restarted!',
    gameStarted: 'Game started! ',
    generatedAttributes: 'LLM generated attributes',
    incorrect: 'Incorrect. Draw a new card and pass your turn.',
    inputWord: 'Please input a word',
    ItemsList: 'Items List',
    ItemsListDescription:
      "(The ✅❌ displayed in the list are the actual attributes of the items, and the red and green background indicates the correctness of the user's response.)",
    llmConfig: 'LLM Configuration',
    llmGenerating: 'Generating...',
    loading: 'Loading...',
    noAttributesSelected: 'No attributes selected',
    noExplanation: 'No explanation returned by the model',
    noItemsAdded: 'No items added yet',
    noNameSelected: 'No name selected',
    notRestartGame: 'No, do not restart game',
    provider: 'Provider',
    reset: 'Reset',
    restartGame: 'Restart Game',
    save: 'Save',
    settings: 'Settings',
    showGeneratedAttributes: 'Show LLM generated attributes',
    startGame: 'Start Game',
    startGameDescription: `_Thing in Rings_ is a game for multiple players and one Referee.

The core mechanic revolves around a three-zone Venn diagram. At the start, the Referee randomly selects attributes for each zone of the Venn diagram, these attributes remain hidden from players: 
- **Attribute**: represents relatively subjective qualities of objects
- **Context**: represents relatively objective qualities
- **Word**: represents characteristics of the object's English name

The Referee will puts 3 initial items into the diagram.

Each player holds 5 private items unseen by others. Each turn, a player places one item into a zone of the Venn diagram (or outside it, representing None). The Referee judges whether the item matches the zone's attributes:
- If correct: the player continues their turn (may place another item)
- If incorrect: the player draws a random item, which the Referee then places in the correct zone, and the turn passes to the next player

The winning condition is being the first to play all cards from one's hand.`,
    undo: 'Undo',
    word: 'Word',
    wordFeature: 'Word Feature',
    yesRestartGame: 'Yes, restart the game',
  },
  zh: {
    announcement: `该网站并不提供完整的游戏功能，而是由 AI 担任“裁判”的角色，负责开局区域属性的设置以及出牌正确性的判断。你仍然需要为朋友们准备好实体物品卡以供游戏使用。`,
    attribute: '主观属性',
    cancel: '取消',
    configureLLM: '配置 LLM',
    configureLLMFirst: '请先完成 LLM 配置',
    confirm: '确认',
    confirmdo: '您确定要执行此操作吗？',
    context: '客观属性',
    correct: '正确！继续你的回合。',
    correctArea: '正确的区域是：',
    create: '创建',
    createSuccess: '物品创建成功',
    custom: '自定义',
    description: '描述（可选）',
    dragHint: '将物品拖动到 venn 图中的区域',
    expand: '展开',
    expandExplanation: '展开解释',
    gameRestarted: '游戏已重新开始！',
    gameStarted: '游戏开始！',
    generatedAttributes: '模型生成的预设属性',
    incorrect: '错误。抽一张新卡并结束回合。',
    inputWord: '请输入单词',
    ItemsList: '物品列表',
    ItemsListDescription:
      '（列表中显示的✅❌是物品的真实属性，背景的红色和绿色指示了用户回答的正确性）',
    llmConfig: 'LLM 配置',
    llmGenerating: '生成中...',
    loading: '加载中...',
    noAttributesSelected: '没有选择属性',
    noExplanation: '模型没有返回解释',
    noItemsAdded: '还没有添加物品',
    noNameSelected: '没有指定名称',
    notRestartGame: '点错了',
    provider: '服务商',
    reset: '重置',
    restartGame: '重新开始',
    save: '保存',
    settings: '设置',
    showGeneratedAttributes: '显示模型生成的预设属性',
    startGame: '开始游戏',
    startGameDescription: `_Thing in Rings_ 是一款多人加一位"裁判"参与的桌游。[查看实况视频](https://www.bilibili.com/video/BV1qxdUY1EUx/)

游戏核心机制围绕三连通 venn 图展开。开局时，"裁判"会为 venn 图的每个区域随机选定属性，这些属性对玩家保密：
- **Attribute**：代表物品的相对主观特性
- **Context**：代表物品的相对客观特性
- **Word**：代表物品英文单词的特征

并且"裁判"向 venn 图上放入 3 个初始物品。

每位玩家持有 5 个其他玩家不可见的物品。每回合，玩家将一个物品放入 venn 图的某个区域（包括图外，代表 None）。"裁判"会判断该物品是否符合该区域的属性：
- 若符合：该玩家继续回合（可再放置物品）；
- 若不符合：玩家抽取一张随机物品，"裁判"会将该物品放入正确区域，并移交回合给下一位玩家。

胜利条件是率先打空手牌的玩家获胜。`,
    undo: '撤销',
    word: '单词',
    wordFeature: '单词特征',
    yesRestartGame: '是的，重新开始',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
