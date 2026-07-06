const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" in request body' });
  }

  // 1. Manually piece together your provided browser session cookies
  // Ensure the token chunks match your actual JSON values
  const cookieString = [
    '__cf_bm=RWilE3IFY3C_xXYRrYeDVPNwBOrFHSYhz6d.a4KDpLQ-1783330070.8127615-1.0.1.1-FMLwjATqsLHyOlk0hMmkiC3PwQNCX7rjSpraolnXbw4GcU.O1aGccH8RuXFRYXNhJImGA.yJDQh_lKizP_QGObMLEVWdRtJL1IMoPOKS41Vv5_JvEffEKiEQ1maJIFCP',
    '__Secure-next-auth.session-token.0=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..LNZa2wvcDBdf78Lu.j4Kt8gguDexqpAq3wdJWa_QQlqcLvx7wp9x8KsFMvGROVJlw-TuzdvFP3H9NByHjabYea8EuDYzt2wz6aSBudQbCKvfM3xlvBjgyAa8TyTpXOKcPV-d-GE2SLseutwU77llch-WiVoO1QBEgUvB29NPxQrHuHqseHjqr02pdIBCvYq6yuQ6c1QYsSTrNQdfh_5PdG6Ia8aXQD6UGAB60LCNK6My8mCXnAu94Vk8w4ZtqrI6hj6h8H-oGt0KCFZ7qLf21tQ3TzwpTgC0wOWAwOgzSLNEnrXyekftmd8bxg3AG_TXKYwOmI5ufVt8nLm1p74pLV6GfjvfHqpnQg66miQxBU4gfAZSGqvKj4C50fps391BMdJQy5NeKuIauPBJgn0MGzfrECgb85DPjOgPTrJ0qI9NTb2ptZW-uYOd75cPWJKjGglSk54QBzebCRnUzhWnUoccoXjyaA2L6fc3Vq9CzzU5NO-bhcLLcWdPuRMfyQADFKYVZh5OB_J3Iv6tLRG2VS8lPvU0kyKjPmhqTbtsjWZOawi84wVt21eRv4MOZC5IzgsGOs7gugAY-mvugayFwvtuQ2-YjrIZX535fLazzwnTasah9hBvkHVsTgkxuRLiKzUEIdIkZ4wSLT4TCgI5VEm_BycQ_qfdP9B8La6qrJbkoNEO6GeX8jZlrWRnMnOPaVsFdu-3RIFQIbwMkEBVbkPkVUHZeDGMNOAf-b-A1mRfwx1kZEoTcWeyNlWdBpdu8z9hasn_TrSzIK_2JcZV4NMvoGD-scGeat-csd9p0hoaOAnETRHP6ST45tud7daMOTln3DdWOUzeMNN4m8qH2AQ4pdYVzrGXTerDM3T_0Zm91xDxNFnZZaBLotJlg58vSzcYufh0YObLySAMRIHOdR4jLChDAagNvabWOGCgTLAcugAV8saDapghPdd2V4EsvAgUPjkr0_VgR_zPfjvQ9mVHyydqfj-ZfV57f8-Ld0O7c7ssq1Cffk2joX7GwPgdBZVWRCKummf4DErQYPn_JHQF4idkRfW4T4vJ7IzXdrPtKwR-bFH897WHPXDL8FUwAxhXU3aI9JOZ6-0g4fDSDv6hK59OkmceegEDuv-8I-UMOlLl55x6xwdv_F2yAo6QVDpX-MPiNY0cAX7smwIix7g0STRo1PEdOIpY_1BzAGGz2wNS1GgpeUObso_BDNfDuzp0WgsRYe_D-KfFVi6O9DoRXea2-bBvQ9VA6ttPgDKBzCOOfymR0Yiq3jtA0B12RH1y3fzPRZY7NwnR_nGLh-796DEuptRW8Bs8-upk2lftoYbYaqnPyhT326-p4nmtUE76moG1gMfIqfZfkoxAfb_x_7uwuSSjfgbW9EwNkYz6nxsbhy_kFB5RLlUWv_DHJJvWJIqrJMUH5VPqrF2OB8bPUCn6q9qxB9ELfIPSMYDd8IL_RAc9VBiGt1zym_IDGDDMUY41ckCRR-gIkmsaHKRohJTXT8dere9uPftg6eDUk6R8BL1v7Hqc-ZJSjDPzqgck4nqgfSn2GWBrLD5gsYmIvF9lwHX4Q0l6squnkakyNqzHVgpZ65KoRC2qPqcI6vOwMo7H_04uUp-a2o_Z0rOfxNHc1OqvDRn1-BgryQd02H2XK5ld9o0LaPQr1zUOKEuEeIdpjVrMc6GQ1Ij2sNCFkxmBNPB6cSnMVOSfWF2RynZoza75tBhY6127SZIaTkfDnL3GIwk_5PfDM2ok0bu0f6vjCD9DH7FIMPougDaqwbCs9tyPos8q1Ex7G4-L0AibX6fhK3migFzlB2twkPAx37wAKvZCbmjzgI7POVkcvA0knYLG50DlEyBo1GwNILizaHXKNvFaoi9nutZpNLDytG0nkf8C9J-oZRgN5aZ03q4GeGnp0KC0EJIonnCWbD_IKG2XlmljUuIjBFBwfarqaNE6Xt3xLIIgcbtdjBnsC78bZtu6vd9qUVujlaHvI-Ky3TiAnwJp3MzauZgitqtTzpCu8c85BTApz81SiWJaHzEqr1ocwL3sNxuFeGN15SzXGMXYpXR48-dwIELieblOV9Jv7skN1IjxHaFKFfyUQEt7q5-LP8-gypmRlCUyz5GHlT6HnFjOpAr0ITLl_GP7i4A-2qqEXR1AIBe_C_pi_R-dl2fSxGlsrGhE5S_ITxJtK0qTQGxGFU8n8y4HjytnkSw4EdHT35WSS7EN7AeDRhW5E_ssIwC29M_2TArJ0xP4EwZ_d6XeduxZgUw2l_3GHdGU0M38SNBKn0ox8fGKKTMU5DqCGye63-cYwSJkx_hnma28sYi4F9dNKapL10akqK3_UIDG01PWwlcswBU_yrDfrsxnuNcLZfVAlnJGZK1D2eGUxN3BmAgCrt8bbgtal8Eq0-zWcxHuQxXqom8hT8AoSSbhcnxY5AnTLoEmozA8uvCKDEgcnK0UOah1m1_wkqOvkcCabKekFB_XytEJw13P0O3713OjEex05wJbcriguPK62qT1IifEUzT1i2IBfm32LEbeL5X8P-IyrW1Nh9gKj_cF4jjj_gbEOXNT8ndfVH2rkCdH-yYlhg3m-Oc4m8NqxPk5DvJ3Ja9UjznoFHLAPWYaIm4rLE0dUgSjTU6PEc_vpy2iBc6VLgaINOOsDQqVYgk6ruycnuGjAY1JU1s7Pkf0YlwR_g9trFJTzKHE4DcxvlIOX8cw9NnoneSfjJNsx4CLg_siI9FECz7Zqepyhj8D1W2f7RgUh28J6AJIbMkhI6mCQacGWUD3dv9AiQ0hZm0Zw0Qf5_0BOUfYmpFM2cxsKENIpnpv1qoU0THpUc5IF8AeBjvruxov_haHUxt-9i8TyG3Qtg-mWCsSlQoxjdVOKiAtIzX8X0NIWF0lBnOEXXgwfGhsfeSNh46uk9g81VQVOkoiijA7687BopjlSGgjA61QA4fqunl04ANqDMIvzNlkSa7fnlM9SytNJfzSJ7pmcLG7m4bt0DVPlwVApzMzjDpUjiNRv069vHQ_lBRtycJoiK3AmeuwyUauZW1Rek5XcqmExnocKDmS1S6VmIEMYMWCIqV4qeKXpVfwHJbWlRe4ZU9RNWSs1Y242ThbtiSUI0_inI4-2ExqPbOMTAS-_k2CeT97d821poquH402-GowRckx1yx4p8dK-D7L0eC3J7QfIAmfZqdBR5_gV3zqHjsLPSLtNo5DLxohQTAVr6Nh6kQ8Xp1w1xyJziJHo7jmTxJ5LR5Q3RLxZ9JD09zn6DFapk8hTISYv6GqUf-O-OXzDGz3VCuoZevCOVHZnuF21HY72ISWSnEHVU3JVNzeogybOx7JOKAg-PwzF5KZtkIJmFwjOXGkWvZwJ3JC0VU-dkyuU9A66XKcFH83aUmrdmhLtCINjpGNpPOos4TD49egvqG3HpKGzG4ebSCmRFN0FMj1dtkbxlllVa9NU4LyVz3Yv6TB5y3AWQQbfShNMcosa_EIbwULFoZiRFEpFhhbMrJRvMYH0u7LGNtVxfHQUIXy9nMSawdUZLvb3natA8u5KHBKJwR0GKFwE6ytMJRKRh50H6OefEcdOUYHSDOnCRPFKyHiR-04l9HohpV3mF6d1fqu8IuQ1B6N9ZNdk7Y5nvEHa3FdqBcd9CUdgKZ62VZZr2dwingArXYTHHnQYvdCWYM7AzRAQAHSU3QcH_ghpaU-Sb6ykZvIhkNZZ7Wc3WjOClW2tci0rgO06EsEg_YWHURNQBPPuv8U_VZ_oWB1tX-Zq9Pu1agntgJl4_2iWXNeBTI8tTze7OGJw7_GvAOiBW2LGkuA5kzM3UwdEkDsfvSHUMvSFAzBsiud-IxgWZPPkhfLhGnfkWWINaMDYv1HAgKf-JoQP0j2BBO3ajd4oCVdKhPhwfQ9Bxb_jhdN',
    '__Secure-next-auth.session-token.1=cJPDVpOQvm1FyL7A3w5mBs2vezXhh.cSILkxAXlsbucwclWxxxrA',
    '_cfuvid=1bzhKIPexz7VVTRpnr6_3yuBmZRQypKZ42HnDk.wp28-1783328023.5648243-1.0.1.1-WBVTlrFDZ6byIPDVTJbSc266JraCWZjkzWTw98PdYEI',
    'oai-did=68cdcef8-2180-4101-869a-2c00f98e72de'
  ].join('; ');

  // 2. Prepare payload structure mimicking the chat interface
  const payload = {
    action: 'next',
    messages: [
      {
        id: "dce91eab-3d44-4f90-8d59-c3d317ff0a5b", // Arbitrary frontend UUID
        author: { role: 'user' },
        content: { content_type: 'text', parts: [message] },
        metadata: {}
      }
    ],
    parent_message_id: "a1a8c90b-0442-4e92-bd87-ee01438a025c", // Arbitrary root UUID
    model: 'auto',
    timezone_offset_min: -480,
    history_and_training_disabled: false
  };

  try {
    const response = await fetch('https://chatgpt.com/backend-api/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/event-stream', // Web UI uses Server-Sent Events (SSE)
        'Origin': 'https://chatgpt.com',
        'Referer': 'https://chatgpt.com/'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'OpenAI rejected cookie auth', details: errText });
    }

    // Capture response string (Note: Web API outputs Server-Sent Events text blocks)
    const data = await response.text();
    return res.status(200).send(data);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
