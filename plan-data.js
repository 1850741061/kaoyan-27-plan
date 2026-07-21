(function exposePlanData(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KaoyanPlanData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";

  const PLAN_START = "2026-07-18";
  const DETAILED_PLAN_END = "2026-11-15";
  const MAX_PLAN_END = "2026-12-31";
  const CONTENT_VERSION = 1;

  const focus = (mode, scope) => Object.freeze({ mode, scope });
  const day = (math, cs, english) => Object.freeze({ math, cs, english });

  const kickoff = day(
    focus("timed", "高数第十一章摸底：曲线积分、曲面积分与三大公式"),
    focus("timed", "计组当前进度摸底：指令格式、寻址方式与指令周期"),
    focus("reading", "英语一 2005 年 Text 1 基线测试")
  );

  const preludeReview = Object.freeze({
    theme: "建立三科基线与执行规则",
    math: "整理第十一章摸底错因，确定尚未收口的两个知识点",
    cs: "画出指令执行流程，列出计组第四章的三个断点",
    english: "复盘 2005 Text 1，建立阅读错因标签",
    catchup: "只补摸底暴露出的一个最大断点，不开启额外新课"
  });

  const weeks = Object.freeze([
    {
      start: "2026-07-20",
      theme: "高数剩余章节收口 · 计组 CPU 主线",
      days: [
        day(focus("learn", "两类曲线积分的定义、参数化与换元"), focus("learn", "指令格式、操作码扩展与常见寻址方式"), focus("sentence", "2005 年 Text 2 的 3 个核心长难句")),
        day(focus("practice", "格林公式、路径无关与曲线积分计算"), focus("practice", "指令周期、数据通路与控制信号"), focus("reading", "2005 年 Text 2：定位句与选项替换")),
        day(focus("learn", "两类曲面积分、投影法与对称性"), focus("learn", "CPU 功能、寄存器组织与基本数据通路"), focus("sentence", "2005 年 Text 3 的 3 个核心长难句")),
        day(focus("practice", "高斯、斯托克斯公式与曲线曲面积分综合"), focus("learn", "硬布线控制器：节拍、微操作与控制信号"), focus("reading", "2005 年 Text 3：论证结构与干扰项")),
        day(focus("practice", "级数判敛、幂级数与傅里叶级数框架"), focus("learn", "微程序控制器：微指令格式与地址形成"), focus("translation", "2005 年翻译：逐句切分与成句")),
        day(focus("timed", "高数剩余内容收官测验：第十一、十二章"), focus("practice", "指令流水线、数据冒险与控制冒险"), focus("reading", "2005 年 Text 4 + 本周阅读错因归档"))
      ],
      review: {
        math: "第十一、十二章剩余内容与高数收官周检",
        cs: "指令系统—CPU—流水线闭卷框架周检",
        english: "2005 年阅读证据链与长难句周检",
        catchup: "在第十一章和 CPU 主线中只补正确率最低的一项"
      }
    },
    {
      start: "2026-07-27",
      theme: "线代行列式矩阵 · 计组总线与 I/O 收口",
      days: [
        day(focus("learn", "行列式定义、性质与按行按列展开"), focus("practice", "流水线性能、超标量与多处理器基础"), focus("reading", "2006 年 Text 1：段落主旨与态度题")),
        day(focus("practice", "行列式计算、特殊行列式与克拉默法则"), focus("learn", "总线组成、性能指标与事务流程"), focus("sentence", "2006 年 Text 2 的 3 个核心长难句")),
        day(focus("learn", "矩阵运算、逆矩阵与伴随矩阵"), focus("practice", "总线仲裁、同步定时与异步定时"), focus("reading", "2006 年 Text 2：定位与同义替换")),
        day(focus("practice", "初等变换、矩阵秩与阶梯形"), focus("learn", "I/O 接口、程序查询与中断方式"), focus("translation", "2006 年翻译：代词指代与逻辑关系")),
        day(focus("practice", "逆矩阵、分块矩阵与矩阵方程"), focus("practice", "DMA、中断优先级与 I/O 数据传送"), focus("newtype", "2006 年新题型：段落匹配与衔接线索")),
        day(focus("timed", "行列式与矩阵模块测验"), focus("timed", "计组指令—CPU—总线—I/O 综合章测"), focus("reading", "2006 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "行列式性质、矩阵运算与秩周检",
        cs: "计组后半程综合选择与数据通路周检",
        english: "2006 年阅读、翻译与新题型周检",
        catchup: "优先补行列式计算或计组数据通路中的一个断点"
      }
    },
    {
      start: "2026-08-03",
      theme: "线代方程向量 · 操作系统入场",
      days: [
        day(focus("learn", "高斯消元与线性方程组解的判定"), focus("practice", "计组数制—存储—指令—CPU 混合题组"), focus("reading", "2007 年 Text 1：事实题与推断题")),
        day(focus("learn", "向量的线性组合、等价与生成空间"), focus("timed", "计组首轮 120 分钟综合测验"), focus("sentence", "2007 年 Text 2 的 3 个核心长难句")),
        day(focus("practice", "线性相关、极大无关组与向量组秩"), focus("correct", "计组首轮测验订正与一页框架压缩"), focus("reading", "2007 年 Text 2：证据句与错误选项")),
        day(focus("practice", "齐次与非齐次方程组的解结构"), focus("learn", "操作系统概念、特征、内核与中断异常"), focus("translation", "2007 年翻译：从句嵌套与语序重组")),
        day(focus("learn", "特征值、特征向量与特征多项式"), focus("learn", "进程状态、PCB、上下文切换与线程"), focus("newtype", "2007 年新题型：段落排序与指代")),
        day(focus("practice", "相似矩阵与矩阵可对角化条件"), focus("practice", "处理机调度算法与周转时间计算"), focus("reading", "2007 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "方程组、向量组与特征值周检",
        cs: "计组首轮收官 + OS 进程基础周检",
        english: "2007 年阅读与翻译周检",
        catchup: "只补一道方程组或特征值综合题，同时保证 OS 已经入场"
      }
    },
    {
      start: "2026-08-10",
      theme: "线代收口与概率入场 · OS 进程同步",
      days: [
        day(focus("learn", "实对称矩阵与正交相似对角化"), focus("learn", "并发、临界区、互斥与同步基本概念"), focus("reading", "2008 年 Text 1：中心论点与例证")),
        day(focus("practice", "二次型、正交变换与正定判定"), focus("learn", "信号量机制与 P/V 操作语义"), focus("sentence", "2008 年 Text 2 的 3 个核心长难句")),
        day(focus("timed", "线性代数首轮综合测验"), focus("practice", "生产者—消费者与缓冲区 P/V 题"), focus("reading", "2008 年 Text 2：定位与干扰项归因")),
        day(focus("learn", "随机事件、概率公理与古典概型"), focus("practice", "读者—写者与哲学家进餐 P/V 题"), focus("translation", "2008 年翻译：非谓语与抽象名词")),
        day(focus("practice", "条件概率、全概率、贝叶斯与事件独立性"), focus("learn", "死锁条件、资源分配图与银行家算法"), focus("newtype", "2008 年新题型：小标题匹配")),
        day(focus("learn", "随机变量、分布函数与离散型分布"), focus("timed", "进程调度、同步与死锁模块测验"), focus("reading", "2008 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "线代首轮收口 + 概率事件与分布启动周检",
        cs: "进程调度、P/V 与死锁周检",
        english: "2008 年阅读与新题型周检",
        catchup: "只重做一道线代综合题或一道 P/V 综合题，概率新线不断档"
      }
    },
    {
      start: "2026-08-17",
      theme: "概率分布 · OS 存储文件 · 计网启动",
      days: [
        day(focus("learn", "常见离散分布及其概率计算"), focus("learn", "连续分配、分页存储与地址转换"), focus("reading", "2009 年 Text 1：作者态度与观点归属")),
        day(focus("learn", "连续型随机变量、密度与常见分布"), focus("practice", "分页、分段、段页式地址转换"), focus("sentence", "2009 年 Text 2 的 3 个核心长难句")),
        day(focus("practice", "一维随机变量函数的分布"), focus("learn", "虚拟存储、请求分页与页面置换"), focus("reading", "2009 年 Text 2：推断题证据边界")),
        day(focus("learn", "二维随机变量、联合分布与边缘分布"), focus("learn", "文件系统、I/O 软件层次与磁盘调度"), focus("translation", "2009 年翻译：插入语与同位语")),
        day(focus("practice", "条件分布与随机变量独立性"), focus("learn", "计网体系结构、分层模型与物理层指标"), focus("newtype", "2009 年新题型：信息匹配")),
        day(focus("practice", "二维连续变量区域积分与概率计算"), focus("learn", "物理层编码、调制、信道容量与传输介质"), focus("reading", "2009 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "一维与二维随机变量分布周检",
        cs: "OS 存储文件 I/O + 计网物理层周检",
        english: "2009 年阅读、翻译与匹配题周检",
        catchup: "优先补一个分布区域或地址转换断点，不整章回看线代或 OS"
      }
    },
    {
      start: "2026-08-24",
      theme: "概率数字特征与统计 · 计网链路网络层",
      days: [
        day(focus("practice", "二维随机变量函数的分布"), focus("learn", "数据链路层成帧、差错检测与流量控制"), focus("reading", "2010 年 Text 1：主旨与写作目的")),
        day(focus("learn", "数学期望、方差与常用公式"), focus("practice", "停止—等待、GBN 与选择重传协议"), focus("sentence", "2010 年 Text 2 的 3 个核心长难句")),
        day(focus("practice", "协方差、相关系数与二维数字特征"), focus("learn", "以太网、CSMA/CD、交换机与 VLAN"), focus("reading", "2010 年 Text 2：同义替换与范围陷阱")),
        day(focus("learn", "大数定律与中心极限定理"), focus("learn", "IPv4 分组、地址分类、子网与 CIDR"), focus("translation", "2010 年翻译：被动语态与名词化")),
        day(focus("learn", "总体、样本、统计量与经验分布"), focus("practice", "子网划分、路由聚合与最长前缀匹配"), focus("newtype", "2010 年新题型：段落排序")),
        day(focus("practice", "卡方、t、F 分布与抽样分布"), focus("practice", "IP 分片、ARP、DHCP 与 ICMP"), focus("reading", "2010 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "二维数字特征、大数定律与抽样分布周检",
        cs: "链路可靠传输、以太网与 IP 地址周检",
        english: "2010 年阅读与翻译周检",
        catchup: "只补一个数字特征模型或一组子网划分题"
      }
    },
    {
      start: "2026-08-31",
      theme: "概率统计收口 · 计网传输层",
      days: [
        day(focus("learn", "矩估计与最大似然估计"), focus("learn", "路由算法、RIP、OSPF 与 BGP 基础"), focus("reading", "2011 年 Text 1：论点与论据关系")),
        day(focus("practice", "区间估计与假设检验基本题"), focus("learn", "UDP、端口、复用分用与校验"), focus("sentence", "2011 年 Text 2 的 3 个核心长难句")),
        day(focus("timed", "概率论与数理统计首轮综合测验"), focus("learn", "TCP 报文、连接管理与可靠传输"), focus("reading", "2011 年 Text 2：推断与态度题")),
        day(focus("correct", "概率统计测验订正与公式卡压缩"), focus("practice", "TCP 滑动窗口、流量控制与超时重传"), focus("translation", "2011 年翻译：并列结构与语义补全")),
        day(focus("timed", "数学基础三模块选择填空混合测验"), focus("practice", "TCP 拥塞控制状态与窗口计算"), focus("newtype", "2011 年新题型：段落匹配")),
        day(focus("timed", "数学基础三模块大题混合测验"), focus("practice", "TCP 综合计算与状态变化"), focus("reading", "2011 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "概率统计收口与数学三模块混合周检",
        cs: "网络层协议 + TCP 可靠传输周检",
        english: "2011 年阅读、新题型与翻译周检",
        catchup: "优先补概率统计测验或 TCP 窗口变化中的一个断点"
      }
    },
    {
      start: "2026-09-07",
      theme: "数学基础总检 · 计网收口 · 408 二轮启动",
      days: [
        day(focus("timed", "数学基础阶段 120 分钟综合测验"), focus("learn", "DNS、FTP、电子邮件与 HTTP/HTTPS"), focus("reading", "2012 年 Text 1：细节定位与概念替换")),
        day(focus("correct", "数学基础综合测验订正与失分排序"), focus("timed", "计网首轮闭卷综合测验"), focus("sentence", "2012 年 Text 2 的 3 个核心长难句")),
        day(focus("practice", "高数剩余内容与极限薄弱题组"), focus("correct", "计网测验订正与五层协议图压缩"), focus("reading", "2012 年 Text 2：态度与例证题")),
        day(focus("practice", "线代与概率重复错因题组"), focus("correct", "408 四科一页框架与薄弱点排序"), focus("translation", "2012 年翻译：指代还原与逻辑显化")),
        day(focus("practice", "极限计算与方法选择强化入口"), focus("practice", "数据结构线性表与链表综合题"), focus("newtype", "2012 年新题型：排序与衔接")),
        day(focus("timed", "极限与连续强化前测"), focus("practice", "栈、队列、数组与字符串综合题"), focus("reading", "2012 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "数学基础总检与强化入口周检",
        cs: "计网收官 + 408 四科二轮入口周检",
        english: "2012 年阅读、翻译与新题型周检",
        catchup: "根据章测数据，只补概率或计网中失分最高的一个模块"
      }
    },
    {
      start: "2026-09-14",
      theme: "数学极限强化 · 数据结构强化",
      days: [
        day(focus("practice", "函数极限与数列极限的基本计算"), focus("practice", "二叉树性质、遍历与线索二叉树"), focus("reading", "2013 年 Text 1：主旨、态度与写作手法")),
        day(focus("practice", "等价无穷小、洛必达与泰勒展开选择"), focus("practice", "树、森林、并查集与 Huffman/WPL"), focus("sentence", "2013 年 Text 2 的 3 个核心长难句")),
        day(focus("practice", "连续性、间断点与分段函数"), focus("practice", "图的存储、DFS、BFS 与连通性"), focus("reading", "2013 年 Text 2：范围词与因果倒置")),
        day(focus("practice", "单侧极限、夹逼与递推数列"), focus("practice", "最小生成树、最短路径与拓扑排序"), focus("translation", "2013 年翻译：多重从句与重心调整")),
        day(focus("practice", "中值定理辅助的极限证明"), focus("practice", "查找、平衡树与散列表"), focus("newtype", "2013 年新题型：信息匹配")),
        day(focus("timed", "极限与连续专题限时测验"), focus("timed", "排序算法、复杂度与数据结构综合测验"), focus("reading", "2013 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "极限方法选择与连续性周检",
        cs: "树、图、查找与排序周检",
        english: "2013 年阅读与翻译周检",
        catchup: "只补一种极限方法或一个图算法，不扩散到整章"
      }
    },
    {
      start: "2026-09-21",
      theme: "一元微分强化 · 计组表示与存储强化",
      days: [
        day(focus("practice", "导数定义、分段函数与高阶导数"), focus("practice", "数制转换、定点数与浮点数表示"), focus("reading", "2014 年 Text 1：中心论点与段间关系")),
        day(focus("practice", "隐函数、参数方程与相关变化率"), focus("practice", "补码运算、溢出判断与 ALU"), focus("sentence", "2014 年 Text 2 的 3 个核心长难句")),
        day(focus("practice", "罗尔、拉格朗日与柯西中值定理"), focus("practice", "存储器层次、局部性与 Cache 映射"), focus("reading", "2014 年 Text 2：推断边界与偷换概念")),
        day(focus("practice", "泰勒公式与中值定理证明题"), focus("practice", "Cache 命中率、写策略与地址划分"), focus("translation", "2014 年翻译：抽象主语与被动转换")),
        day(focus("practice", "单调性、极值、最值与曲率"), focus("practice", "主存扩展、交叉编址与存储芯片计算"), focus("writing", "英语一小作文：通知与建议信各一份提纲")),
        day(focus("timed", "一元微分专题限时测验"), focus("timed", "数据表示、运算器与存储系统测验"), focus("reading", "2014 年 Text 3—4 限时双篇"))
      ],
      review: {
        math: "中值定理、导数应用与证明周检",
        cs: "数据表示、运算与 Cache 周检",
        english: "2014 年阅读、翻译与小作文周检",
        catchup: "优先补一道中值定理证明或一组 Cache 地址题"
      }
    },
    {
      start: "2026-09-28",
      theme: "积分与微分方程强化 · 计组 CPU 强化",
      days: [
        day(focus("practice", "不定积分换元、分部与有理函数"), focus("practice", "指令格式设计与寻址有效地址计算"), focus("correct", "2005—2007 阅读错题：证据句重定位")),
        day(focus("practice", "定积分性质、对称性与分段积分"), focus("practice", "指令周期、数据通路与控制信号综合"), focus("translation", "2005—2007 翻译错句二刷")),
        day(focus("practice", "定积分几何应用与物理应用"), focus("practice", "硬布线与微程序控制器综合"), focus("newtype", "2005—2007 新题型错题二刷")),
        day(focus("practice", "反常积分敛散性与参数积分"), focus("practice", "流水线吞吐率、加速比与冒险处理"), focus("writing", "英语一大作文：图画描述与中心句")),
        day(focus("practice", "一阶微分方程与可降阶方程"), focus("practice", "总线、中断与 DMA 综合计算"), focus("writing", "英语一小作文：道歉信与申请信")),
        day(focus("timed", "积分与微分方程专题限时测验"), focus("timed", "计组指令—CPU—总线—I/O 二轮测验"), focus("reading", "早年阅读错题随机双篇复测"))
      ],
      review: {
        math: "积分方法与微分方程周检",
        cs: "指令、CPU、流水线与 I/O 周检",
        english: "早年真题错题二刷与写作框架周检",
        catchup: "只补一种积分模型或一道流水线综合题"
      }
    },
    {
      start: "2026-10-05",
      theme: "多元与曲面积分强化 · OS 强化",
      days: [
        day(focus("practice", "多元函数极限、连续与偏导数"), focus("practice", "进程状态、调度指标与调度算法"), focus("correct", "2008—2009 阅读错题：选项陷阱二刷")),
        day(focus("practice", "全微分、复合函数与隐函数求导"), focus("practice", "信号量与经典 P/V 综合题"), focus("translation", "2008—2009 翻译错句二刷")),
        day(focus("practice", "多元函数极值、条件极值与最值"), focus("practice", "死锁、银行家算法与资源分配图"), focus("newtype", "2008—2009 新题型错题二刷")),
        day(focus("practice", "二重积分区域拆分与坐标变换"), focus("practice", "分页、分段与虚拟地址转换"), focus("writing", "英语一大作文：原因分析与建议段")),
        day(focus("practice", "三重积分与重积分应用"), focus("practice", "页面置换、工作集与抖动"), focus("writing", "英语一小作文：邀请信与感谢信")),
        day(focus("timed", "多元微分与重积分专题测验"), focus("timed", "OS 进程、存储、文件与 I/O 二轮测验"), focus("reading", "2008—2011 阅读错题随机双篇复测"))
      ],
      review: {
        math: "多元微分、重积分与区域选择周检",
        cs: "OS 进程、内存、文件与 I/O 周检",
        english: "2008—2011 错题二刷与写作周检",
        catchup: "只补一个积分区域或一道 P/V/地址转换题"
      }
    },
    {
      start: "2026-10-12",
      theme: "三科专题收束 · 真题阶段切换",
      days: [
        day(focus("practice", "曲线曲面积分与无穷级数混合题"), focus("practice", "文件分配、磁盘调度与 I/O 综合"), focus("correct", "2010—2011 阅读错题：定位与推断二刷")),
        day(focus("practice", "行列式、矩阵与秩综合题"), focus("practice", "数据链路可靠传输与以太网综合"), focus("translation", "2010—2011 翻译错句二刷")),
        day(focus("practice", "向量组、方程组与解空间综合题"), focus("practice", "IP、路由与子网划分综合"), focus("newtype", "2010—2011 新题型错题二刷")),
        day(focus("practice", "特征值、二次型与概率综合题"), focus("practice", "TCP 与应用层协议综合"), focus("writing", "大小作文个人模板第一次闭卷输出")),
        day(focus("timed", "2010 年数学一选择填空模块"), focus("timed", "2010 年 408 选择题模块"), focus("correct", "2012—2014 阅读错题：错误选项归因二刷")),
        day(focus("timed", "2010 年数学一大题模块"), focus("timed", "2010 年 408 综合题模块"), focus("writing", "大小作文模板脱稿改写与句式替换"))
      ],
      review: {
        math: "2010 真题模块得分与专题漏洞周检",
        cs: "2010 真题模块与四科失分结构周检",
        english: "早年真题二刷与写作模板周检",
        catchup: "按真题失分排序，只修补一个数学模块和一个 408 知识点"
      }
    },
    {
      start: "2026-10-19",
      theme: "真题周一 · 建立整卷节奏",
      days: [
        day(focus("mock", "2011 年数学一整卷"), focus("practice", "数据结构树与图错题组"), focus("translation", "2012—2014 翻译错句复测")),
        day(focus("correct", "2011 年数学一整卷订正与同类题"), focus("practice", "计组 Cache、指令与 CPU 错题组"), focus("writing", "大作文：图画描述、寓意与论证闭卷成文")),
        day(focus("practice", "极限、积分与微分方程弱项题组"), focus("mock", "2011 年 408 整卷"), focus("newtype", "2012—2014 新题型错题复测")),
        day(focus("practice", "线代与概率弱项题组"), focus("correct", "2011 年 408 整卷订正与知识回填"), focus("writing", "小作文：书信类 15 分钟成文")),
        day(focus("timed", "数学选择填空 60 分钟速度训练"), focus("timed", "408 选择题 60 分钟速度训练"), focus("mock", "2015 年英语一整卷")),
        day(focus("timed", "数学高数大题 90 分钟组合"), focus("timed", "408 四科综合题 90 分钟组合"), focus("correct", "2015 年英语一整卷订正与词句归档"))
      ],
      review: {
        math: "2011 整卷时间分配与失分结构周检",
        cs: "2011 整卷四科失分结构周检",
        english: "2015 整卷阅读、翻译与写作周检",
        catchup: "只回做本周两张整卷中价值最高的三道错题"
      }
    },
    {
      start: "2026-10-26",
      theme: "真题周二 · 两套轮转与及时订正",
      days: [
        day(focus("mock", "2012 年数学一整卷"), focus("practice", "数据结构算法与复杂度错题组"), focus("translation", "2015 年英语一翻译订正复测")),
        day(focus("correct", "2012 年数学一订正与限时回做"), focus("mock", "2012 年 408 整卷"), focus("writing", "大作文：社会现象类 35 分钟成文")),
        day(focus("practice", "2012 数学错题对应专题补洞"), focus("correct", "2012 年 408 订正与知识回填"), focus("newtype", "2015 年英语一新题型复测")),
        day(focus("mock", "2013 年数学一整卷"), focus("practice", "OS 进程、内存与文件错题组"), focus("reading", "英语阅读未做材料双篇限时")),
        day(focus("correct", "2013 年数学一订正与限时回做"), focus("mock", "2013 年 408 整卷"), focus("writing", "小作文：通知与告示 15 分钟成文")),
        day(focus("practice", "2012—2013 数学重复错因专项"), focus("correct", "2013 年 408 订正与重复错因专项"), focus("mock", "2016 年英语一整卷"))
      ],
      review: {
        math: "2012—2013 两套整卷重复错因周检",
        cs: "2012—2013 两套 408 四科失分周检",
        english: "2016 整卷时间分配与作文周检",
        catchup: "不补做新卷，只清理重复出现两次以上的错因"
      }
    },
    {
      start: "2026-11-02",
      theme: "真题周三 · 报名确认期稳态输出",
      days: [
        day(focus("mock", "2014 年数学一整卷"), focus("practice", "计网链路、IP 与 TCP 错题组"), focus("translation", "2016 年英语一翻译订正复测")),
        day(focus("correct", "2014 年数学一订正与限时回做"), focus("mock", "2014 年 408 整卷"), focus("writing", "大作文：文化品质类 35 分钟成文")),
        day(focus("practice", "2014 数学错题对应专题补洞"), focus("correct", "2014 年 408 订正与知识回填"), focus("mock", "2017 年英语一整卷")),
        day(focus("mock", "2015 年数学一整卷"), focus("practice", "408 四科选择题速度组"), focus("correct", "2017 年英语一整卷订正与词句归档")),
        day(focus("correct", "2015 年数学一订正与限时回做"), focus("mock", "2015 年 408 整卷"), focus("writing", "小作文：申请、投诉与建议信提纲复测")),
        day(focus("timed", "2014—2015 数学高频失分模块复测"), focus("correct", "2015 年 408 订正与重复错因专项"), focus("reading", "2015—2017 阅读错题随机双篇复测"))
      ],
      review: {
        math: "2014—2015 整卷得分稳定性周检",
        cs: "2014—2015 408 整卷得分稳定性周检",
        english: "2017 整卷与作文输出周检",
        catchup: "网上确认优先；学习只处理本周三科各一个最高频错因"
      }
    },
    {
      start: "2026-11-09",
      theme: "阶段收官 · 压缩错题与交接下一轮",
      days: [
        day(focus("mock", "2016 年数学一整卷"), focus("practice", "数据结构与计组高频错题压缩"), focus("translation", "2015—2017 翻译错句随机复测")),
        day(focus("correct", "2016 年数学一订正与公式卡压缩"), focus("mock", "2016 年 408 整卷"), focus("writing", "大作文个人模板第二次闭卷成文")),
        day(focus("practice", "2011—2016 数学重复错因清单复测"), focus("correct", "2016 年 408 订正与框架卡压缩"), focus("mock", "2018 年英语一整卷")),
        day(focus("mock", "2017 年数学一整卷"), focus("practice", "OS 与计网高频错题压缩"), focus("correct", "2018 年英语一整卷订正与表达库压缩")),
        day(focus("correct", "2017 年数学一订正与下一轮入口"), focus("mock", "2017 年 408 整卷"), focus("writing", "大小作文模板各一次脱稿提纲")),
        day(focus("timed", "数学一阶段终检：选择填空 + 两道薄弱大题"), focus("correct", "2017 年 408 订正与下一轮入口"), focus("timed", "英语阶段终检：阅读双篇 + 翻译 + 作文提纲"))
      ],
      review: {
        math: "2011—2017 真题得分曲线与压缩错题册验收",
        cs: "2011—2017 408 得分曲线与四科框架验收",
        english: "2015—2018 整卷表现与写作模板验收",
        catchup: "完成阶段数据归档，明确 11 月 16 日后第一套保留真题与首个弱项"
      }
    }
  ]);

  const registrationEvents = Object.freeze({
    "2026-09-20": {
      title: "核对目标院校招生简章与专业目录",
      objective: "确认目标专业是否仍考数学一、英语一和 408，并记录任何报考条件变化。",
      doneWhen: "招生简章、专业目录、参考说明均已查看；考试科目、学习方式、学制学费和特殊条件已截图归档。",
      steps: ["从目标院校研究生院官网进入", "核对专业代码、方向和初试科目", "核对学历、专业或工作年限限制", "保存原文链接、PDF 与截图"]
    },
    "2026-09-28": {
      title: "确认报考条件、考试科目与报考点",
      objective: "在报名开始前排除专业、身份和报考点选择错误。",
      doneWhen: "形成一页报名核对表，报考单位、专业代码、研究方向、考试科目和候选报考点均有官方依据。",
      steps: ["核对教育部与省级网报公告", "核对招生单位报考条件", "按身份筛选可选报考点", "把待确认问题列成清单"]
    },
    "2026-10-10": {
      title: "预计预报名窗口：填写并逐项校验",
      objective: "若官方预报名已开放，完成填报；未开放则只做材料和彩排，不依据预计日期强行操作。",
      doneWhen: "官方日期已核验；开放时完成填报并保存报名号，未开放时完成全部字段的离线核对。",
      steps: ["先核验研招网与省级官方公告", "逐字段填写并和证件原件比对", "核对招生单位、专业、方向与考试科目", "提交后截图并双重保存报名号"]
    },
    "2026-10-16": {
      title: "预计正式报名开启：填报、缴费与留痕",
      objective: "在官方窗口内完成有效报名，不把生成报名号误当成缴费成功。",
      doneWhen: "报名信息、报名号、缴费状态均已复核并截图；如官方尚未开放，已更新真实办理日期。",
      steps: ["核验研招网正式公告", "复查身份、学历与报考信息", "按所在地要求完成缴费", "保存报名号、缴费结果和完整信息表"]
    },
    "2026-10-25": {
      title: "报名信息最终复核与风险清单清零",
      objective: "在官方截止前处理所有可修改问题和待确认项。",
      doneWhen: "姓名证件、学历学籍、报考单位专业、报考点、联系方式和缴费状态全部打勾；风险清单为空。",
      steps: ["下载或截图完整报名信息", "逐项对照报名核对表", "处理学历校验或报考点疑问", "再次备份报名号与缴费凭证"]
    },
    "2026-11-01": {
      title: "查看省级机构与报考点网上确认公告",
      objective: "取得本人报考点的真实确认时间、材料、照片和上传要求。",
      doneWhen: "确认起止时间、入口、材料格式和审核周期均已记录，并设置两个提前提醒。",
      steps: ["进入省级考试机构官网", "进入所选报考点公告页", "下载材料清单并逐项准备", "记录补审方式与咨询电话"]
    },
    "2026-11-03": {
      title: "预计网上确认：上传材料并提交审核",
      objective: "以本人报考点公告为准完成确认，避免照片、证件或学籍材料不合格。",
      doneWhen: "所有材料上传清晰、状态显示已提交或审核中，关键页面已截图；若日期不同，已改到真实日期。",
      steps: ["先核对本人报考点真实窗口", "按要求拍摄并检查材料四角与清晰度", "逐项上传并复核", "提交后每天查看审核状态"]
    },
    "2026-11-05": {
      title: "复核网上确认结果与补充材料状态",
      objective: "确保网上确认最终通过，而不只停留在已提交。",
      doneWhen: "状态明确为审核通过；若退回，已在官方期限内补正并再次确认。",
      steps: ["登录官方确认入口查看状态", "阅读退回原因或站内通知", "需要时立即补充材料", "保存最终通过页面与通知"]
    }
  });

  const intensityTargets = Object.freeze({
    light: {
      mathLearn: "完成 1 页框架、4 道例题和 8 道基础题；基础题正确率不低于 75%。",
      mathPractice: "限时完成 12 道代表题；正确率不低于 75%，错题写明概念、方法或计算原因。",
      csLearn: "闭卷画 1 页结构，完成 12 道选择题和 1 道综合题；选择题正确率不低于 75%。",
      csPractice: "限时完成 18 道选择题和 1 道综合题；所有错误定位到具体知识节点。",
      reinforce: "闭卷重做今日错题，并完成 4 道同类题；连续两次做对才归档。"
    },
    standard: {
      mathLearn: "完成 1 页框架、6 道例题和 12 道基础题；基础题正确率不低于 80%。",
      mathPractice: "限时完成 20 道代表题；正确率不低于 80%，错题写明概念、方法或计算原因。",
      csLearn: "闭卷画 1 页结构，完成 20 道选择题和 1 道综合题；选择题正确率不低于 80%。",
      csPractice: "限时完成 30 道选择题和 2 道综合题；所有错误定位到具体知识节点。",
      reinforce: "闭卷重做今日错题，并完成 8 道同类题；连续两次做对才归档。"
    },
    sprint: {
      mathLearn: "完成 1 页框架、8 道例题、16 道基础题和 4 道提高题；基础题正确率不低于 85%。",
      mathPractice: "限时完成 28 道代表题；正确率不低于 85%，错题当天完成同类变式。",
      csLearn: "闭卷画 1 页结构，完成 30 道选择题和 2 道综合题；选择题正确率不低于 85%。",
      csPractice: "限时完成 40 道选择题和 3 道综合题；错误节点当天回填框架。",
      reinforce: "闭卷重做今日错题，并完成 12 道同类题；整理一张可快速复习的压缩卡。"
    }
  });

  function parseUTC(value) {
    const [year, month, date] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, date));
  }

  function toISO(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(value, amount) {
    const date = parseUTC(value);
    date.setUTCDate(date.getUTCDate() + amount);
    return toISO(date);
  }

  function dayDifference(later, earlier) {
    return Math.round((parseUTC(later) - parseUTC(earlier)) / 86400000);
  }

  function weekday(value) {
    return parseUTC(value).getUTCDay();
  }

  function studyOrdinal(value) {
    let ordinal = 0;
    for (let cursor = PLAN_START; cursor < value; cursor = addDays(cursor, 1)) {
      if (weekday(cursor) !== 0) ordinal += 1;
    }
    return ordinal;
  }

  function resolveDetailedPlan(value) {
    if (value === PLAN_START) return { kind: "study", theme: "摸底与启动", ...kickoff };
    if (value === "2026-07-19") return { kind: "recovery", review: preludeReview };
    for (const week of weeks) {
      const offset = dayDifference(value, week.start);
      if (offset >= 0 && offset <= 5) return { kind: "study", theme: week.theme, ...week.days[offset] };
      if (offset === 6) return { kind: "recovery", review: { theme: week.theme, ...week.review } };
    }
    return null;
  }

  function extensionPlan(value) {
    const firstWeek = "2026-11-16";
    const offset = dayDifference(value, firstWeek);
    const weekIndex = Math.max(0, Math.floor(offset / 7));
    const dayIndex = ((offset % 7) + 7) % 7;
    const mathYear = 2018 + (weekIndex % 8);
    const csYear = 2018 + (weekIndex % 8);
    const englishYear = 2019 + (weekIndex % 7);
    const theme = `保留真题轮转 · 第 ${weekIndex + 1} 周`;
    if (dayIndex === 6) {
      return {
        kind: "recovery",
        review: {
          theme,
          math: `${mathYear} 年数学一整卷与错题复测周检`,
          cs: `${csYear} 年 408 整卷与四科失分周检`,
          english: `${englishYear} 年英语一整卷与写作周检`,
          catchup: "按得分数据只修三科各一个最高频错因，不临时加新卷"
        }
      };
    }
    const schedules = [
      day(focus("mock", `${mathYear} 年数学一整卷`), focus("practice", "本周 408 高频错题组"), focus("translation", "近年翻译错句随机复测")),
      day(focus("correct", `${mathYear} 年数学一整卷订正与同类题`), focus("practice", "数据结构与计组薄弱专题"), focus("writing", "大小作文个人模板限时输出")),
      day(focus("practice", "本周数学重复错因专题"), focus("mock", `${csYear} 年 408 整卷`), focus("newtype", "近年新题型限时训练")),
      day(focus("timed", "数学选择填空与薄弱大题组合"), focus("correct", `${csYear} 年 408 整卷订正与知识回填`), focus("reading", "近年未做阅读双篇限时")),
      day(focus("practice", "数学高频错题二刷"), focus("practice", "408 四科选择题速度组"), focus("mock", `${englishYear} 年英语一整卷`)),
      day(focus("timed", "数学一周终检组合"), focus("timed", "408 一周终检组合"), focus("correct", `${englishYear} 年英语一整卷订正`))
    ];
    return { kind: "study", theme, ...schedules[dayIndex] };
  }

  function resolvePlan(value) {
    if (value < PLAN_START || value > MAX_PLAN_END) return null;
    return resolveDetailedPlan(value) || extensionPlan(value);
  }

  function makeTask(date, key, start, end, subject, title, objective, doneWhen, steps, extra = {}) {
    return {
      templateKey: `${date}:${key}`,
      contentVersion: CONTENT_VERSION,
      date,
      start,
      end,
      subject,
      title,
      objective,
      doneWhen,
      steps,
      generated: true,
      ...extra
    };
  }

  function mathTask(date, key, start, end, item, intensity) {
    const targets = intensityTargets[intensity] || intensityTargets.standard;
    const commonSteps = ["5 分钟闭卷写出公式、条件和题型入口", "限时独立完成，不边做边看解析", "按概念 / 方法 / 计算标记错因", "把需要回做的题号写入晚间任务"];
    if (item.mode === "learn") return makeTask(date, key, start, end, "math", `新课收口｜${item.scope}`, `建立“${item.scope}”的题型入口，并能从条件独立选出方法。`, targets.mathLearn, commonSteps);
    if (item.mode === "practice") return makeTask(date, key, start, end, "math", `专题题组｜${item.scope}`, `把“${item.scope}”从会看解析推进到能限时独立完成。`, targets.mathPractice, commonSteps);
    if (item.mode === "timed") return makeTask(date, key, start, end, "math", `限时检测｜${item.scope}`, `用一次闭卷检测暴露“${item.scope}”的真实得分能力。`, "按任务时段闭卷完成并计分；未完成题、错题和犹豫题全部标记，得分率达到 70% 才算通过。", ["准备空白答题纸并设置倒计时", "严格按考试方式作答", "结束后立即计分并标注耗时", "只记录前三个主要失分原因"]);
    if (item.mode === "correct") return makeTask(date, key, start, end, "math", `订正复测｜${item.scope}`, `消除“${item.scope}”中已经暴露的失分原因，而不是抄写答案。`, "所有错题均能遮住解析独立重做；每类错因再做 2 道同类题，重复错误清零。", ["先不看解析再次作答", "对照解析定位第一个错误步骤", "给错因贴上概念 / 方法 / 计算标签", "完成同类题并更新压缩错题卡"]);
    if (item.mode === "mock") return makeTask(date, key, start, end, "math", `整卷模拟｜${item.scope}`, `在真实 180 分钟边界内检验数学一的取舍、速度和书写。`, "180 分钟闭卷完成整卷并记录每部分用时；离场前不查答案，交卷后得到客观分数和失分结构。", ["按正式考试准备答题纸与计时器", "选择填空控制在预设时间内", "大题写完整关键步骤并主动跳过卡题", "交卷后只计分和标记，不在本时段订正"]);
    return mathTask(date, key, start, end, focus("practice", item.scope), intensity);
  }

  function csTask(date, key, start, end, item, intensity) {
    const targets = intensityTargets[intensity] || intensityTargets.standard;
    const commonSteps = ["闭卷画出本节结构与关键数据流", "完成选择题后再核对概念边界", "综合题写全中间步骤与单位", "把错误回填到四科知识图"];
    if (item.mode === "learn") return makeTask(date, key, start, end, "cs", `首轮建模｜${item.scope}`, `把“${item.scope}”建立成可闭卷调用的结构，而不是零散结论。`, targets.csLearn, commonSteps);
    if (item.mode === "practice") return makeTask(date, key, start, end, "cs", `专题强化｜${item.scope}`, `通过题目校准“${item.scope}”的概念边界和综合题步骤。`, targets.csPractice, commonSteps);
    if (item.mode === "timed") return makeTask(date, key, start, end, "cs", `限时检测｜${item.scope}`, `检测“${item.scope}”在限时条件下的选择题速度和综合题表达。`, "按任务时段闭卷完成并计分；选择题正确率不低于 80%，综合题关键步骤得分率不低于 70%。", ["先完成选择题并记录用时", "综合题写完整数据结构或计算过程", "结束后按评分点计分", "列出失分最多的三个知识节点"]);
    if (item.mode === "correct") return makeTask(date, key, start, end, "cs", `订正补图｜${item.scope}`, `把“${item.scope}”的错题回填到四科知识图，并能再次独立作答。`, "所有错题闭卷重做；错误节点已回填知识图，每类错误再完成 5 道选择或 1 道同类综合题。", ["遮住解析重做错题", "定位错误对应的最小知识节点", "补画流程、表格或地址变化", "完成同类题并记录是否仍错"]);
    if (item.mode === "mock") return makeTask(date, key, start, end, "cs", `整卷模拟｜${item.scope}`, `在真实 180 分钟边界内检验 408 四科时间分配和综合题步骤。`, "180 分钟闭卷完成整卷；记录四科用时与得分，选择题和综合题分别统计失分。", ["按正式考试准备答题纸与计时器", "选择题按稳定节奏推进并标记犹豫题", "综合题写全算法、地址或同步步骤", "交卷后只计分和标记，不在本时段订正"]);
    return csTask(date, key, start, end, focus("practice", item.scope), intensity);
  }

  function englishTask(date, key, start, end, item) {
    if (item.mode === "sentence") return makeTask(date, key, start, end, "english", `长难句｜${item.scope}`, `看清“${item.scope}”中的主干、从句和修饰关系，并形成通顺译文。`, "所列 3 句均能独立划分结构、指出连接词作用并口头回译；每句只保留一个关键语法点。", ["遮住译文独立断句", "圈主谓宾并标从句边界", "按意群翻译而非逐词替换", "对照解析后重新口译一遍"]);
    if (item.mode === "reading") return makeTask(date, key, start, end, "english", `真题阅读｜${item.scope}`, `以原文证据完成“${item.scope}”，建立定位和排除干扰项的稳定流程。`, "每篇首次作答控制在 18 分钟左右；每道题能指出定位句，错误选项能标明偷换、扩大、因果或无中生有。", ["限时作答且不查词", "回原文标出每题定位句", "逐项写出正确与错误依据", "只收录 5—8 个高频词和一个主错因"]);
    if (item.mode === "translation") return makeTask(date, key, start, end, "english", `真题翻译｜${item.scope}`, `把结构分析转成准确、通顺、完整的中文句子。`, "完成所列翻译并按采分点自评；主干、从句关系和关键含义无遗漏，同一句完成一次脱稿重译。", ["先断句并找主干", "标出代词、并列和逻辑关系", "按中文语序成句", "对照采分点后脱稿重译"]);
    if (item.mode === "newtype") return makeTask(date, key, start, end, "english", `新题型｜${item.scope}`, `用衔接词、指代和段落功能解决“${item.scope}”，避免只凭语感。`, "在 20 分钟内完成一组；每个选择都能说出至少一个结构或语义依据。", ["先读标题、首尾句和已知结构", "标出指代、复现词与逻辑词", "完成匹配或排序", "复盘错误位置而非全文翻译"]);
    if (item.mode === "writing") return makeTask(date, key, start, end, "english", `写作输出｜${item.scope}`, `把个人模板转成适配题目的完整表达，减少现场拼句。`, "按任务要求完成提纲或全文；主题明确、结构完整、无明显语法错误，并替换至少 3 处模板化表达。", ["3 分钟审题并确定读者与目的", "列三段功能和关键词", "限时完成提纲或全文", "检查时态、单复数、拼写和衔接"]);
    if (item.mode === "correct") return makeTask(date, key, start, end, "english", `真题订正｜${item.scope}`, `把“${item.scope}”中的失分压缩为词汇、定位、结构或表达四类问题。`, "错题均能重新定位证据；翻译和写作按采分点修改，形成不超过一页的复盘记录。", ["遮住答案重新完成失分部分", "按四类问题标注错因", "重译关键句或重写问题段落", "把高频词和表达加入复习卡"]);
    if (item.mode === "timed") return makeTask(date, key, start, end, "english", `限时检测｜${item.scope}`, `检验“${item.scope}”的速度、证据定位和输出稳定性。`, "严格按限定时间完成并计分；阅读逐题有证据，翻译和作文按采分点自评。", ["设置倒计时并一次完成", "全程不查词和模板", "结束后立即计分", "记录时间超支点与前三个失分原因"]);
    if (item.mode === "mock") return makeTask(date, key, start, end, "english", `整卷模拟｜${item.scope}`, `在真实 180 分钟边界内检验英语一各题型顺序和写作输出。`, "180 分钟闭卷完成整卷；记录各题型用时、客观题得分，并按采分点估算翻译和作文。", ["按正式考试顺序准备答题纸", "阅读与新题型坚持证据定位", "翻译保主干与关键含义", "大小作文留出检查时间后交卷"]);
    return englishTask(date, key, start, end, focus("reading", item.scope));
  }

  function vocabularyTask(date, start, end) {
    const ordinal = studyOrdinal(date) + 1;
    let title;
    let objective;
    let doneWhen;
    let steps;
    if (date <= "2026-08-16") {
      title = `核心词汇首轮补齐 · 第 ${ordinal} 组`;
      objective = "补齐尚未覆盖的核心词，同时用间隔复习守住旧词。";
      doneWhen = "新词 50 个完成识义与例句辨析，旧词复习 200 个；抽测正确率不低于 85%，错词进入明日队列。";
      steps = ["先复习到期旧词 200 个", "学习新词 50 个并只记核心义", "用词根、搭配或真题例句区分近义词", "随机抽测并标记错词"];
    } else if (date <= "2026-09-13") {
      title = `核心词汇首轮收口 · 第 ${ordinal} 组`;
      objective = "完成首轮剩余词汇并提高快速反应速度。";
      doneWhen = "新词 35 个、复习词 250 个；中文释义反应在 3 秒内，抽测正确率不低于 90%。";
      steps = ["复习到期词 250 个", "学习剩余新词 35 个", "把熟词僻义和固定搭配放入真题语境", "抽测后只保留仍错的词"];
    } else if (date <= "2026-10-15") {
      title = `高频词二轮 · 第 ${ordinal} 组`;
      objective = "从认识单词推进到能在真题句子中迅速调用含义。";
      doneWhen = "复习高频词 300 个和个人错词 30 个；真题语境抽测正确率不低于 92%。";
      steps = ["快速过高频词 300 个", "重点复习个人错词 30 个", "口头说出熟词僻义或常见搭配", "删除已连续三次答对的卡片"];
    } else {
      title = `真题词与表达压缩 · 第 ${ordinal} 组`;
      objective = "只保留真题反复出现和个人持续出错的词与表达。";
      doneWhen = "复习真题词 250 个、错词 30 个和写作表达 10 条；随机抽测正确率不低于 95%。";
      steps = ["复习真题高频词 250 个", "清理个人错词 30 个", "默写写作表达 10 条", "把仍错内容安排到 1、3、7 天后"];
    }
    return makeTask(date, "english-vocabulary", start, end, "english", title, objective, doneWhen, steps);
  }

  function reinforcementTask(date, key, start, end, subject, item, intensity) {
    const targets = intensityTargets[intensity] || intensityTargets.standard;
    if (subject === "math") {
      return makeTask(date, key, start, end, "math", `当日回炉｜${item.scope}`, `在同一天重新调用“${item.scope}”，阻止“听懂但不会做”。`, targets.reinforce, ["不看笔记口述题型入口", "优先重做上午错题", "完成同类变式并记录用时", "仍错题排入周日补缺候选"]);
    }
    return makeTask(date, key, start, end, "cs", `闭卷回填｜${item.scope}`, `把“${item.scope}”压缩进四科知识图，并检验能否脱离讲义调用。`, intensity === "light" ? "闭卷补完框架，完成 10 道选择题；所有错误标回知识图。" : "闭卷补完框架，完成 15 道选择题或 1 道综合题；所有错误标回知识图。", ["闭卷画 5 分钟结构图", "对照讲义补缺不重抄", "完成选择或综合题", "口头复述数据流、状态变化或算法步骤"]);
  }

  function sportTask(date) {
    const sportByDay = {
      0: ["恢复日｜快走 + 全身拉伸", "以恢复为主，保持活动但不制造额外疲劳。", ["快走或低强度骑行 40—50 分钟", "肩颈、髋踝与后链拉伸", "补水并正常进餐", "若疼痛异常则停止训练"]],
      1: ["有氧基础｜低强度耐力", "用可持续有氧恢复久坐后的循环和注意力。", ["10 分钟动态热身", "40—50 分钟可交谈强度有氧", "10 分钟核心稳定", "拉伸、洗漱与进餐"]],
      2: ["力量基础｜下肢 + 推", "维持基础力量和体态，不追求力竭。", ["10 分钟热身", "深蹲类与推类各 3—4 组", "核心稳定 10 分钟", "拉伸、洗漱与进餐"]],
      3: ["主动恢复｜灵活性 + 快走", "降低前三天累积疲劳，保护颈肩腰背。", ["快走 30—40 分钟", "胸椎、肩颈与髋部灵活性", "轻量核心激活", "洗漱并正常进餐"]],
      4: ["有氧进阶｜节奏变化", "在不过度疲劳的前提下提高心肺耐力。", ["10 分钟热身", "30 分钟稳态 + 6 组短节奏变化", "慢走放松", "拉伸、洗漱与进餐"]],
      5: ["力量基础｜后链 + 拉", "平衡久坐姿态并维持后链和背部力量。", ["10 分钟热身", "髋铰链类与拉类各 3—4 组", "肩胛稳定与核心训练", "拉伸、洗漱与进餐"]],
      6: ["综合活动｜球类 / 游泳 / 户外", "用喜欢的活动结束学习周，强度保持可恢复。", ["选择一种低风险活动", "主体活动 50—70 分钟", "补水与全身拉伸", "洗漱并正常进餐"]]
    };
    const [title, objective, steps] = sportByDay[weekday(date)];
    return makeTask(date, "sport", "17:00", "19:00", "sport", title, objective, "完成热身、主体活动和拉伸；19:00 后精神稳定、无明显疲劳或疼痛。", steps, { fixed: true });
  }

  function reviewTask(date, start, end, theme) {
    return makeTask(date, "daily-review", start, end, "review", `每日关账｜${theme}`, "把今天的执行结果转成明天可以直接开始的一步。", "记录三科实际完成量与正确率、一个最大断点、一个顺延项和明日第一动作；顺延项不超过 1 个。", ["填入实际学习时长", "记录数学、英语、408 的完成量或正确率", "选出唯一最大断点", "写明明天打开资料后的第一动作"]);
  }

  function weeklyTasks(date, review) {
    return [
      makeTask(date, "weekly-math", "09:00", "10:30", "math", `数学周检｜${review.math}`, `验证本周数学主线是否形成可调用的方法，而不是追求新题数量。`, "60 分钟闭卷完成一组周检并计分，30 分钟只订正前三个主要失分点；得分率不低于 75%。", ["从本周任务中抽取代表题", "闭卷限时作答", "按步骤计分并排序错因", "选出下周需复测的 2 道题"]),
      makeTask(date, "weekly-vocabulary", "10:40", "11:20", "english", "词汇周测｜到期词 + 本周错词", "检验本周词汇是否能在 3 秒内识别，而不是重复翻卡片。", "随机抽测 150 个到期词和全部本周错词；正确率不低于 90%，仍错词进入 1、3、7 天复习队列。", ["随机抽取到期词", "先测后看答案", "区分完全不会与熟词僻义", "重新安排仍错词的复习日期"]),
      makeTask(date, "weekly-cs", "14:00", "15:20", "cs", `408 周检｜${review.cs}`, "用闭卷框架和题目验证本周 408 知识是否连成结构。", "闭卷画框架 15 分钟，完成选择题 25 道和综合题 1 道；选择正确率不低于 80%。", ["闭卷画本周知识图", "完成 25 道混合选择", "完整写 1 道综合题", "把错题定位回知识图"]),
      makeTask(date, "weekly-english", "15:30", "16:10", "english", `英语周检｜${review.english}`, "检查本周阅读证据链、翻译结构或写作输出中的主要问题。", "复测本周两道阅读错题和一个语言输出任务；每个错误都有证据或修改依据。", ["复做两道高价值错题", "口头拆解一个长难句", "重译一句或重写一段", "只保留一个下周重点"]),
      sportTask(date),
      makeTask(date, "weekly-catchup", "19:45", "20:30", "review", `唯一补缺｜${review.catchup}`, "用有限补缺防止任务滚雪球，同时保留周日恢复属性。", "只处理一个 45 分钟内可收口的未完成项；超出部分主动移入下周，不并行开启多个旧任务。", ["按影响程度排序未完成项", "只选择第一项", "设定 45 分钟硬停止", "写明已收口或下周继续的具体位置"]),
      makeTask(date, "weekly-review", "20:40", "21:00", "review", `周复盘｜${review.theme}`, "用本周数据决定下周唯一调整项。", "写清三科完成量、整卷或题组正确率、有效学习时长和下周只修正的一件事。", ["汇总本周完成与正确率", "找出重复两次以上的错因", "删除一个低价值安排", "写下周一第一任务"])
    ];
  }

  const regularSlots = Object.freeze({
    light: {
      math: ["09:00", "10:45"], vocab: ["10:55", "11:35"], cs: ["14:00", "15:30"], english: ["15:40", "16:30"],
      mathReinforce: ["19:45", "20:45"], review: ["21:00", "21:20"]
    },
    standard: {
      math: ["08:00", "10:15"], vocab: ["10:30", "11:15"], cs: ["13:30", "15:15"], english: ["15:30", "16:30"],
      mathReinforce: ["19:30", "20:45"], csReinforce: ["21:00", "21:45"], review: ["21:50", "22:05"]
    },
    sprint: {
      math: ["07:40", "10:20"], vocab: ["10:35", "11:35"], cs: ["13:00", "15:30"], english: ["15:40", "16:40"],
      mathReinforce: ["19:30", "21:10"], csReinforce: ["21:20", "22:20"], review: ["22:20", "22:30"]
    }
  });

  function regularStudyTasks(date, plan, intensity) {
    const effectiveIntensity = regularSlots[intensity] ? intensity : "standard";
    const slots = regularSlots[effectiveIntensity];
    const tasks = [
      mathTask(date, "math-primary", ...slots.math, plan.math, effectiveIntensity),
      vocabularyTask(date, ...slots.vocab),
      csTask(date, "cs-primary", ...slots.cs, plan.cs, effectiveIntensity),
      englishTask(date, "english-primary", ...slots.english, plan.english),
      sportTask(date),
      reinforcementTask(date, "math-reinforce", ...slots.mathReinforce, "math", plan.math, effectiveIntensity)
    ];
    if (slots.csReinforce) tasks.push(reinforcementTask(date, "cs-reinforce", ...slots.csReinforce, "cs", plan.cs, effectiveIntensity));
    tasks.push(reviewTask(date, ...slots.review, plan.theme));
    return tasks;
  }

  function mathMockTasks(date, plan) {
    return [
      mathTask(date, "math-mock", "08:00", "11:00", plan.math, "standard"),
      vocabularyTask(date, "11:10", "11:40"),
      csTask(date, "cs-primary", "13:30", "15:15", plan.cs, "standard"),
      englishTask(date, "english-primary", "15:30", "16:30", plan.english),
      sportTask(date),
      makeTask(date, "math-mock-review", "19:30", "21:00", "math", `整卷快评｜${plan.math.scope}`, `把“${plan.math.scope}”的分数拆成知识、方法、计算和时间四类失分。`, "完成客观计分、用时复盘和错因分类；只精订三道最高价值错题，其余排入次日。", ["按评分标准客观计分", "画出各模块得分与用时", "精订三道高价值错题", "确定次日第一个补洞任务"]),
      reinforcementTask(date, "cs-reinforce", "21:10", "21:40", "cs", plan.cs, "light"),
      reviewTask(date, "21:45", "22:00", plan.theme)
    ];
  }

  function csMockTasks(date, plan) {
    return [
      mathTask(date, "math-primary", "08:00", "10:15", plan.math, "standard"),
      vocabularyTask(date, "10:30", "11:15"),
      csTask(date, "cs-mock", "13:30", "16:30", plan.cs, "standard"),
      sportTask(date),
      reinforcementTask(date, "math-reinforce", "19:30", "20:30", "math", plan.math, "light"),
      makeTask(date, "cs-mock-review", "20:40", "22:00", "cs", `整卷快评｜${plan.cs.scope}`, `把“${plan.cs.scope}”的失分拆到数据结构、计组、OS 和计网。`, "完成客观计分、四科用时与失分统计；精订两道综合题或十道高价值选择题。", ["按评分点客观计分", "统计四科选择与综合题失分", "精订最高价值错题", "确定次日需回填的知识节点"]),
      reviewTask(date, "22:00", "22:15", plan.theme)
    ];
  }

  function englishMockTasks(date, plan) {
    return [
      englishTask(date, "english-mock", "08:30", "11:30", plan.english),
      mathTask(date, "math-primary", "13:00", "15:00", plan.math, "light"),
      csTask(date, "cs-primary", "15:10", "16:40", plan.cs, "light"),
      sportTask(date),
      makeTask(date, "english-mock-review", "19:30", "20:45", "english", `整卷快评｜${plan.english.scope}`, `把“${plan.english.scope}”的失分拆到阅读、新题型、翻译和写作。`, "完成客观题计分、翻译作文估分与各题型用时统计；精订两道阅读错题和一个输出问题。", ["统计各题型得分与用时", "重定位两道阅读错题", "重译一个失分句", "修改作文中最影响得分的一段"]),
      reinforcementTask(date, "math-reinforce", "20:55", "21:40", "math", plan.math, "light"),
      reviewTask(date, "21:45", "22:00", plan.theme)
    ];
  }

  function registrationTask(date) {
    const event = registrationEvents[date];
    if (!event) return null;
    const longer = ["2026-10-10", "2026-10-16", "2026-11-03"].includes(date);
    return makeTask(date, "registration", "12:00", longer ? "13:00" : "12:35", "admin", event.title, event.objective, event.doneWhen, event.steps, { registration: true });
  }

  function buildDay(value, intensity = "standard") {
    const plan = resolvePlan(value);
    if (!plan) return [];
    let tasks;
    if (plan.kind === "recovery") tasks = weeklyTasks(value, plan.review);
    else if (plan.math.mode === "mock") tasks = mathMockTasks(value, plan);
    else if (plan.cs.mode === "mock") tasks = csMockTasks(value, plan);
    else if (plan.english.mode === "mock") tasks = englishMockTasks(value, plan);
    else tasks = regularStudyTasks(value, plan, intensity);
    const registration = registrationTask(value);
    if (registration) tasks.push(registration);
    return tasks.sort((left, right) => left.start.localeCompare(right.start));
  }

  return Object.freeze({
    PLAN_START,
    DETAILED_PLAN_END,
    MAX_PLAN_END,
    CONTENT_VERSION,
    registrationEvents,
    buildDay,
    resolvePlan,
    addDays
  });
});
