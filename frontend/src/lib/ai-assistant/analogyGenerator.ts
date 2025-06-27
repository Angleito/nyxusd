// import { pipe } from '@nyxusd/fp-utils';

export interface Analogy {
  concept: string;
  occupation: string;
  explanation: string;
  example?: string;
}

export type Occupation =
  | "chef"
  | "truck_driver"
  | "retail_manager"
  | "teacher"
  | "doctor"
  | "engineer"
  | "general";

export type DeFiConcept =
  | "clmm"
  | "liquidity"
  | "portfolio"
  | "diversification"
  | "risk_management"
  | "yields"
  | "smart_contracts"
  | "pools"
  | "impermanent_loss"
  | "slippage"
  | "gas_fees"
  | "staking";

interface ConceptAnalogies {
  [key: string]: {
    [K in Occupation]?: string;
  };
}

const conceptAnalogies: ConceptAnalogies = {
  clmm: {
    chef: "Think of CLMM (Concentrated Liquidity Market Maker) like managing different cooking stations in your kitchen. Instead of spreading your ingredients evenly across all dishes, you concentrate them where they're needed most - more pasta water at the pasta station during dinner rush, more grill space for steaks on steak night.",
    truck_driver:
      "CLMM is like planning your fuel stops strategically. Instead of carrying extra fuel for the entire route, you concentrate your refueling at specific points where prices are best - more fuel where it's cheaper, less where it's expensive.",
    retail_manager:
      "CLMM works like seasonal inventory management. Instead of stocking everything equally year-round, you concentrate inventory where demand is highest - more winter coats in winter, more swimsuits in summer.",
    teacher:
      "CLMM is like focusing your teaching resources on specific topics. Instead of covering everything equally, you concentrate on areas where students need the most help - more time on fractions if that's challenging, less on topics they've mastered.",
    doctor:
      "CLMM works like triaging patients. You concentrate medical resources where they're most effective - more staff in emergency during flu season, specialized equipment in areas with highest demand.",
    engineer:
      "CLMM is like optimizing resource allocation in a system. Instead of distributing computing power evenly, you concentrate it where workload is highest - more servers for peak traffic times, specialized processors for intensive calculations.",
    general:
      "CLMM allows liquidity providers to concentrate their capital within specific price ranges, making it more efficient than spreading it across all possible prices.",
  },

  liquidity: {
    chef: "Liquidity is your mise en place - all your prepped ingredients ready to go. The more mise en place you have, the smoother your service runs. Low liquidity is like running out of prepped vegetables during dinner rush - everything slows down and gets more expensive.",
    truck_driver:
      "Liquidity is like available parking spaces at truck stops. High liquidity means plenty of spots - easy in, easy out. Low liquidity is like a full lot where you're stuck waiting, losing time and money.",
    retail_manager:
      "Liquidity is your cash register float and quick-moving inventory. High liquidity means smooth transactions and happy customers. Low liquidity is like running out of change on Black Friday - everything grinds to a halt.",
    teacher:
      "Liquidity is like having teaching materials readily available. Good liquidity means you have plenty of resources to draw from - textbooks, examples, activities. Poor liquidity is like trying to teach with limited materials.",
    doctor:
      "Liquidity is like having medical supplies on hand. High liquidity means you can quickly access what you need - medications, equipment, specialists. Low liquidity creates delays and higher costs.",
    engineer:
      "Liquidity is like having spare parts and resources available. High liquidity means quick repairs and smooth operations. Low liquidity causes delays and increased costs when you need something urgently.",
    general:
      "Liquidity refers to how easily an asset can be bought or sold without affecting its price. High liquidity means smooth, efficient trading.",
  },

  portfolio: {
    chef: "Your portfolio is like your complete menu offering. Just as you wouldn't serve only pasta, a good portfolio has variety - appetizers (stable assets), mains (growth assets), and desserts (high-risk, high-reward plays). Balance keeps customers happy and business steady.",
    truck_driver:
      "A portfolio is like your route mix - some steady local runs (stable income), some long-hauls (growth potential), and maybe some expedited freight (high-risk, high-reward). Variety keeps income flowing regardless of market conditions.",
    retail_manager:
      "Your portfolio is like your product mix. You need staples that always sell (stable assets), trending items (growth stocks), and some high-margin specialty goods (risky but profitable ventures). Balance keeps the registers ringing.",
    teacher:
      "A portfolio is like your teaching toolkit. You have different methods for different students - visual aids, hands-on activities, lectures. Diversifying your approaches helps reach all learners effectively.",
    doctor:
      "Your portfolio is like a treatment plan combining different approaches - medication, therapy, lifestyle changes. Using multiple strategies increases the chance of successful outcomes.",
    engineer:
      "A portfolio is like a system with redundancy and fail-safes. Multiple components working together create resilience - if one fails, others compensate.",
    general:
      "A portfolio is a collection of different investments designed to balance risk and reward according to your goals.",
  },

  diversification: {
    chef: "Diversification is like not putting all your eggs in one basket - literally. If your egg supplier fails, you need alternatives. Smart chefs source from multiple vendors, offer various cuisines, and have dishes at different price points.",
    truck_driver:
      "Diversification means not depending on one route or one client. If construction shuts down your main highway or your biggest client cuts orders, you need other options. Multiple revenue streams keep you rolling.",
    retail_manager:
      "Diversification is having multiple product lines and suppliers. If one brand discontinues or a supplier fails, you're not stuck with empty shelves. Variety protects against any single point of failure.",
    teacher:
      "Diversification means using multiple teaching methods. Some students learn visually, others by doing. By diversifying your approach, you ensure no student is left behind if one method doesn't work.",
    doctor:
      "Diversification in treatment means not relying on a single approach. Combining different therapies reduces the risk of total failure if one treatment doesn't work.",
    engineer:
      "Diversification is building redundancy into systems. Multiple power sources, backup systems, alternative routes - ensuring the system continues even if components fail.",
    general:
      "Diversification spreads risk across different investments, reducing the impact if any single investment performs poorly.",
  },

  risk_management: {
    chef: "Risk management is like food safety protocols. You check temperatures, rotate stock, maintain cleanliness - not because problems are guaranteed, but because preventing food poisoning is better than dealing with consequences.",
    truck_driver:
      "Risk management is your pre-trip inspection, insurance, and hours-of-service compliance. You check brakes, maintain proper coverage, and rest adequately - preventing accidents is better than dealing with aftermath.",
    retail_manager:
      "Risk management includes security systems, inventory controls, and insurance. You prevent theft, track shrinkage, and protect against liability - because preventing losses beats recovering from them.",
    teacher:
      "Risk management is like classroom management. You set rules, plan for disruptions, have backup lessons - preparing for challenges before they arise keeps learning on track.",
    doctor:
      "Risk management is preventive care. Regular check-ups, vaccinations, healthy lifestyle promotion - preventing disease is more effective than treating it.",
    engineer:
      "Risk management involves safety factors, testing protocols, and maintenance schedules. You plan for failure modes before they occur to minimize impact.",
    general:
      "Risk management involves identifying, assessing, and controlling threats to capital and earnings.",
  },

  yields: {
    chef: "Yields are like your profit margins. A dish might cost $5 to make and sell for $20 - that's your yield. In DeFi, you're earning returns on your 'ingredients' (capital) by putting them to work.",
    truck_driver:
      "Yields are your profit per mile after expenses. Just like calculating whether a load pays enough after fuel, maintenance, and time, DeFi yields show what your money earns after costs.",
    retail_manager:
      "Yields are like your markup and inventory turnover combined. A product might have 50% markup and turn 12 times yearly - that's your annual yield. DeFi yields work similarly with your invested capital.",
    teacher:
      "Yields are like student progress. The return on your teaching investment shows in improved test scores, skill development, and student engagement.",
    doctor:
      "Yields are treatment outcomes. Your investment of time and resources produces returns in patient health improvements and recovery rates.",
    engineer:
      "Yields are system efficiency metrics. Input resources produce output value - the ratio determines your return on investment.",
    general:
      "Yields are the earnings generated from an investment over a particular period, expressed as a percentage.",
  },

  smart_contracts: {
    chef: "Smart contracts are like kitchen automation. Your oven turns off when the timer ends, the dishwasher runs its cycle automatically. No need for constant supervision - the rules are programmed in.",
    truck_driver:
      "Smart contracts are like electronic logging devices (ELD) and automated toll systems. They execute rules automatically - tracking hours, processing payments, no manual intervention needed.",
    retail_manager:
      "Smart contracts work like your POS system processing loyalty points and discounts automatically. Set the rules once, and every transaction follows them perfectly without manual oversight.",
    teacher:
      "Smart contracts are like automated grading systems. Once you set the criteria, tests are scored automatically according to predetermined rules - no manual intervention needed.",
    doctor:
      "Smart contracts are like automated medication dispensers. They follow exact protocols - right dose, right time, right patient - without human error.",
    engineer:
      "Smart contracts are self-executing code with terms directly written into programming. They automatically execute when conditions are met - no intermediaries needed.",
    general:
      "Smart contracts are self-executing contracts with terms directly written into code, automatically enforcing agreements.",
  },

  pools: {
    chef: "Liquidity pools are like shared prep kitchens. Multiple restaurants contribute ingredients and share the space. Everyone benefits from the combined resources, and fees are split among contributors.",
    truck_driver:
      "Pools are like freight consolidation warehouses. Multiple shippers combine partial loads, creating full trucks. Everyone shares costs and benefits from the efficiency.",
    retail_manager:
      "Pools are like buying cooperatives. Multiple stores pool purchasing power for better prices. Everyone contributes, everyone benefits from the volume discounts.",
    teacher:
      "Pools are like shared resource centers. Teachers contribute materials and everyone can access the combined collection. The more contributors, the richer the resource pool.",
    doctor:
      "Pools are like shared medical facilities. Multiple practices share expensive equipment and facilities, making specialized care more accessible and cost-effective.",
    engineer:
      "Pools are resource reservoirs where multiple parties contribute and share access. Like a shared computing cluster - everyone contributes resources and draws from the collective pool.",
    general:
      "Liquidity pools are smart contracts containing funds that facilitate decentralized trading, lending, and other functions.",
  },

  impermanent_loss: {
    chef: "Impermanent loss is like committing ingredients to a special menu that might not sell. If you prep 50 portions of a fusion dish and regular orders spike instead, you've temporarily 'lost' the flexibility of those ingredients. They're not wasted, just locked into a less profitable use.",
    truck_driver:
      "It's like accepting a dedicated route contract when spot market rates spike. You're not losing money, but you're missing out on higher-paying loads. The 'loss' is temporary - if rates drop, your contract looks smart again.",
    retail_manager:
      "Like stocking up on seasonal items that don't move as expected. Your capital is tied up in inventory that's worth less than if you'd kept cash for trending items. The loss is 'impermanent' because seasons change.",
    teacher:
      "It's like preparing specialized lesson plans that become less valuable if curriculum changes. Your effort isn't lost, but it's temporarily less useful than if you'd kept flexible.",
    doctor:
      "Like specializing in a treatment that becomes less common. Your expertise isn't lost, but it's temporarily less valuable than more general skills would have been.",
    engineer:
      "Like optimizing a system for specific conditions that change. The optimization isn't wrong, but it's temporarily suboptimal for new conditions.",
    general:
      "Impermanent loss occurs when providing liquidity to a pool and the price ratio of deposited assets changes, resulting in less value than simply holding.",
  },

  slippage: {
    chef: "Slippage is like price changes during busy service. You quote a catering job at today's ingredient prices, but by the time you shop, prices have changed. The bigger the order, the more prices might move as you buy up supply.",
    truck_driver:
      "Slippage is like fuel prices changing between dispatch and fillup. You calculate profitability at $3/gallon, but by the time you fuel up, it's $3.20. Bigger tanks mean bigger impact from price moves.",
    retail_manager:
      "Slippage happens when prices change between scanning and payment. Like when a sale ends while customers are in line - the expected price slips away. Larger purchases face bigger potential differences.",
    teacher:
      "Like planning a field trip where bus prices increase between quote and booking. The more buses you need, the more the price might change as availability decreases.",
    doctor:
      "Like medication prices changing between prescription and filling. Ordering large quantities might affect availability and price.",
    engineer:
      "Like component prices changing between design and procurement. Large orders can move market prices, affecting final costs.",
    general:
      "Slippage is the difference between expected and actual trade prices, often occurring in large trades or volatile markets.",
  },

  gas_fees: {
    chef: "Gas fees are like delivery charges. Whether you're sending one dish or fifty, you pay for the delivery service. During rush hour (network congestion), delivery costs more.",
    truck_driver:
      "Gas fees are like toll roads and weigh station fees. Every trip has these costs regardless of load size. During peak hours or heavy traffic, fees might be higher.",
    retail_manager:
      "Gas fees are like credit card processing fees. Every transaction costs money to process, regardless of size. During busy shopping seasons, premium processing might cost more.",
    teacher:
      "Like administrative fees for processing paperwork. Whether filing one form or several, there's a processing cost that varies with how busy the office is.",
    doctor:
      "Like insurance processing fees. Each claim has a cost regardless of size, and complex claims or busy periods mean higher fees.",
    engineer:
      "Like transaction processing costs in any system. Each operation requires computational resources, with costs varying based on complexity and network demand.",
    general:
      "Gas fees are payments made to process and validate transactions on a blockchain network.",
  },

  staking: {
    chef: "Staking is like investing in kitchen equipment that earns rental income. Your mixer works in your kitchen but also 'earns' by supporting the restaurant's operations - like how staked tokens support network security while earning rewards.",
    truck_driver:
      "Staking is like leasing your truck to a carrier during downtime. Your asset is working even when you're not driving - earning steady income while helping the network (carrier) operate.",
    retail_manager:
      "Staking is like investing in store fixtures that generate rental income. Your investment is locked in but earns returns - like how mall kiosks pay percentage rent on sales.",
    teacher:
      "Like contributing teaching materials to a school library. Your resources are locked in but earn 'interest' through improved student outcomes and recognition.",
    doctor:
      "Like investing in medical equipment for a practice. The equipment is committed but generates returns through patient fees and improved care capabilities.",
    engineer:
      "Like contributing computing power to a distributed network. Your resources are locked but earn rewards for supporting system operations.",
    general:
      "Staking involves locking up tokens to support network operations while earning rewards, similar to earning interest.",
  },
};

export const explainWithAnalogy = (
  concept: DeFiConcept,
  occupation: Occupation = "general",
): string => {
  const analogy =
    conceptAnalogies[concept]?.[occupation] ||
    conceptAnalogies[concept]?.general;

  if (!analogy) {
    return `I don't have a specific analogy for ${concept} yet, but I'd be happy to explain it in general terms.`;
  }

  return analogy;
};

export const generateAnalogy = (
  concept: DeFiConcept,
  occupation: Occupation,
  context?: string,
): Analogy => {
  const explanation = explainWithAnalogy(concept, occupation);

  return {
    concept,
    occupation,
    explanation,
    ...(context ? { example: context } : {}),
  };
};

// Helper function to get all available analogies for a concept
export const getAllAnalogiesForConcept = (concept: DeFiConcept): Analogy[] => {
  const analogies = conceptAnalogies[concept];
  if (!analogies) return [];

  return Object.entries(analogies)
    .filter(([_, explanation]) => explanation)
    .map(([occupation, explanation]) => ({
      concept,
      occupation,
      explanation: explanation!,
    }));
};

// Helper function to check if an analogy exists
export const hasAnalogy = (
  concept: DeFiConcept,
  occupation: Occupation,
): boolean => {
  return !!conceptAnalogies[concept]?.[occupation];
};
