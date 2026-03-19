async function test() {
  console.log("1. Starting registration...");
  const regRes = await fetch("https://app.ai.self.xyz/api/agent/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "linked",
      network: "testnet",
      humanAddress: "0x88981f33f679f123c05128080a546944e0b04040"
    })
  });
  const regData = await regRes.json();
  console.log("Registration Response:", JSON.stringify(regData, null, 2).substring(0, 500) + "...");
  
  const token = regData.sessionToken;
  console.log("\n2. Polling status with token:", token.substring(0, 20) + "...");
  
  const statusRes = await fetch(`https://app.ai.self.xyz/api/agent/register/status?token=${token}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  const statusData = await statusRes.json();
  console.log("Status Response:", statusData);
}

test().catch(console.error);
