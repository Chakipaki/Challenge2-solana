// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const newPair = new Keypair();

const FROM_SECRET_KEY = new Uint8Array(
    [
        207,   5, 247, 120,  38, 146, 231,  99,   2, 248,  68,
        213, 124,   6,  51, 210,  54,  14,  63,  41, 228,  77,
        207,  78, 196,  49, 199,  66, 190,  26, 220, 119, 238,
        155,  30, 165, 235,  63, 214, 247, 217, 252, 175,  31,
        76, 226,  92,  57, 162, 165, 235, 216,  17, 106, 236,
        120, 132,  82, 187, 185, 157,   3,  26,  85
    ]
)

const TO_PUBLIC_KEY = newPair.publicKey;

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed') ;
    const fromKeysPair = Keypair.fromSecretKey(FROM_SECRET_KEY);
    const toPubKey = new PublicKey(TO_PUBLIC_KEY);

    console.log("Airdropping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(fromKeysPair.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    let latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });
    console.log("Airdrop completed for the Sender account");

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromKeysPair.publicKey,
            toPubkey: toPubKey,
            lamports: LAMPORTS_PER_SOL / 100
        })
    );

    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeysPair]
    );
    console.log('Signature is ', signature);
}

const checkBalance = async (publicKey, path) => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed') ;
    const balance = await connection.getBalance(new PublicKey(publicKey));
    console.log('Balance', path, '=', balance / LAMPORTS_PER_SOL);
}

const main = async () => {
    await checkBalance(Keypair.fromSecretKey(FROM_SECRET_KEY).publicKey, 'FROM');
    await checkBalance(TO_PUBLIC_KEY, 'TO');
    await transferSol();
    await checkBalance(Keypair.fromSecretKey(FROM_SECRET_KEY).publicKey, 'FROM');
    await checkBalance(TO_PUBLIC_KEY, 'TO');
}

main();
