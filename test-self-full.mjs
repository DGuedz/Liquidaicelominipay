async function test() {
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
  console.log("FULL Registration Response:");
  console.log(JSON.stringify(regData, null, 2));
}

test().catch(console.error);
