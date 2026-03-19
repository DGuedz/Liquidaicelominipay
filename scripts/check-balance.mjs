import { createPublicClient, http, formatEther, getContract } from 'viem';
import { celoAlfajores } from 'viem/chains';

const client = createPublicClient({ 
  chain: celoAlfajores, 
  transport: http('https://alfajores-forno.celo-testnet.org') 
});

const address = '0xb29828B2f9fd938B430E0EC0E2176a264A0906c8';

async function check() {
  const balance = await client.getBalance({ address });
  console.log('CELO Balance:', formatEther(balance));
  
  // USDm Alfajores
  const cusd = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
  try {
    const data = await client.readContract({
      address: cusd,
      abi: [{inputs: [{name: 'owner', type: 'address'}], name: 'balanceOf', outputs: [{name: '', type: 'uint256'}], stateMutability: 'view', type: 'function'}],
      functionName: 'balanceOf',
      args: [address]
    });
    console.log('USDm Balance:', formatEther(data));
  } catch (e) {
    console.log('USDm Check Failed:', e.message);
  }
}

check();