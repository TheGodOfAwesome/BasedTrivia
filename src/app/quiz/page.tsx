"use client";
import React from "react";
import { balanceOf, claimTo, getNFT } from "thirdweb/extensions/erc1155";
import {
	ConnectButton,
	MediaRenderer,
	TransactionButton,
	useActiveAccount,
	useReadContract,
} from "thirdweb/react";
import { accountAbstraction, client, editionDropTokenId } from "../constants";
import Link from "next/link";
import { baseSepolia, optimismSepolia } from "thirdweb/chains";
import { ThirdwebContract, getContract, defineChain } from "thirdweb";
import MuxPlayer from "@mux/mux-player-react"; 

const Quiz: React.FC = () => {
	const smartAccount = useActiveAccount();
	const modeTestnet = defineChain(919);

	return (
		<div className="flex flex-col items-center">
			<div className="flex flex-col items-center" style={{paddingBottom:"12px"}}>
				<h1 className="text-center text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-12 text-zinc-100">
					Based Trivia
				</h1>
				<ConnectButton
					client={client}
					accountAbstraction={accountAbstraction}
					connectModal={{
						size: "compact",
					}}
				/>
			</div>
			
			<div 
				// className="relative bg-black h-56 lg:h-96 w-full xl:w-3/5 overflow-hidden"
			>

				<MuxPlayer
					streamType="live"
					playbackId="nILpL8Eo00nAoOis1cvjbUpPq9c6w8bAkSjmacw8AHxo"
					metadataVideoTitle="Placeholder (optional)"
					metadataViewerUserId="Placeholder (optional)"
					primaryColor="#FFFFFF"
					secondaryColor="#000000"
				/>

			</div>

			<div className="flex flex-row">
				<NFTClaimer
					receiverAddress={smartAccount?.address}
					dropContract={getContract({
						address: "0xbD658E72Ecb1248C0996b457E30e2f16D8dD132e",
						chain: optimismSepolia,
						client,
					})}
					tokenId={0n}
				/>
				<div className="h-auto w-[1px] bg-gray-600 mx-12 mt-8" />
				<NFTClaimer
					receiverAddress={smartAccount?.address}
					dropContract={getContract({
						address: "0x8b3Cb2b05Fde1b65e4261987c438B934b24Cba4B",
						chain: baseSepolia,
						client,
					})}
					tokenId={0n}
				/>
				<div className="h-auto w-[1px] bg-gray-600 mx-12 mt-8" />
				<NFTClaimer
					receiverAddress={smartAccount?.address}
					dropContract={getContract({
						address: "0x78af091d42Df4b6C7bE8683d8C0B5BEF174aC608",
						chain: modeTestnet,
						client,
					})}
					tokenId={0n}
				/>
			</div>

			<Link href={"/"} className="text-sm text-gray-400 mt-8">
				Back to menu
			</Link>
		</div>
	);
};

type NFTClaimerProps = {
	receiverAddress?: string;
	dropContract: ThirdwebContract;
	tokenId: bigint;
};

const NFTClaimer: React.FC<NFTClaimerProps> = (props: NFTClaimerProps) => {
	const { data: nft, isLoading: isNftLoading } = useReadContract(getNFT, {
		contract: props.dropContract,
		tokenId: props.tokenId,
	});
	const { data: ownedNfts } = useReadContract(balanceOf, {
		contract: props.dropContract,
		owner: props.receiverAddress!,
		tokenId: props.tokenId,
		queryOptions: { enabled: !!props.receiverAddress },
	});
	return (
		<div className="flex flex-col my-8">
			{isNftLoading ? (
				<div className="w-full mt-24">Loading...</div>
			) : (
				<>
					{nft ? (
						<MediaRenderer client={client} src={nft.metadata.image} style={{maxHeight:"50px"}}/>
					) : null}
					{props.receiverAddress ? (
						<>
							<p className="font-semibold text-center my-2">
								You answered {ownedNfts?.toString() || "0"} on{" "}
								{props.dropContract.chain.name}
							</p>
							<TransactionButton
								transaction={() =>
									claimTo({
										contract: props.dropContract,
										tokenId: props.tokenId,
										to: props.receiverAddress!,
										quantity: 1n,
									})
								}
								onError={(error) => {
									alert(`Error: ${error.message}`);
								}}
								onTransactionConfirmed={async () => {
									alert("Claim successful!");
								}}
							>
								Select
							</TransactionButton>
						</>
					) : (
						<p className="text-center mt-8">
							Login to answer on {props.dropContract.chain.name}!
						</p>
					)}
				</>
			)}
		</div>
	);
};

export default Quiz;
