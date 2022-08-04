import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ToastId, useToast } from '@chakra-ui/react'
import { ethers } from 'ethers'
import { ApiClientsContext, WebwalletContext } from 'pages/_app'
import { WORKSPACE_REGISTRY_ADDRESS } from 'src/constants/addresses'
import WorkspaceRegistryAbi from 'src/contracts/abi/WorkspaceRegistryAbi.json'
import { useBiconomy } from 'src/hooks/gasless/useBiconomy'
import getErrorMessage from 'src/utils/errorUtils'
import { getExplorerUrlForTxHash } from 'src/utils/formattingUtils'
import {
	apiKey,
	getTransactionReceipt,
	sendGaslessTransaction,
	webHookId
} from 'src/utils/gaslessUtils'
import {
	getSupportedChainIdFromWorkspace,
} from 'src/utils/validationUtils'
import ErrorToast from '../components/ui/toasts/errorToast'
import useQBContract from './contracts/useQBContract'
import { useNetwork } from './gasless/useNetwork'
import { useQuestbookAccount } from './gasless/useQuestbookAccount'

export default function useAddMember(
	data: any,
) {
	const [error, setError] = React.useState<string>()
	const [loading, setLoading] = React.useState(false)
	const [incorrectNetwork, setIncorrectNetwork] = React.useState(false)
	const [transactionData, setTransactionData] = React.useState<any>()
	const { data: accountData, nonce } = useQuestbookAccount()
	const { data: networkData, switchNetwork } = useNetwork()

	const apiClients = useContext(ApiClientsContext)!
	const { workspace } = apiClients

	const currentChainId = useMemo(() => networkData.id, [networkData])

	const chainId = getSupportedChainIdFromWorkspace(workspace)
	const workspaceRegistryContract = useQBContract('workspace', chainId)

	const toastRef = React.useRef<ToastId>()
	const toast = useToast()

	const { webwallet } = useContext(WebwalletContext)!

	const { biconomyDaoObj: biconomy, biconomyWalletClient, scwAddress } = useBiconomy({
		apiKey: apiKey,
		// targetContractABI: WorkspaceRegistryAbi,
	})

	const [isBiconomyInitialised, setIsBiconomyInitialised] = useState<boolean>(false)

	useEffect(() => {
		console.log('THIS IS BICONOMY', biconomy)
		console.log('THIS IS BICONOMY SECOND', biconomyWalletClient)
		if(biconomy && biconomyWalletClient && scwAddress) {
			setIsBiconomyInitialised(true)
		} else {
			setIsBiconomyInitialised(false)
		}
	}, [biconomy, biconomyWalletClient, scwAddress])


	useEffect(() => {
		if(data) {
			setError(undefined)
			setIncorrectNetwork(false)
		}
	}, [data])

	useEffect(() => {
		if(incorrectNetwork) {
			setIncorrectNetwork(false)
		}

	}, [workspaceRegistryContract])

	useEffect(() => {
		if(incorrectNetwork) {
			return
		}

		if(error) {
			return
		}

		if(loading) {
			return
		}
		// console.log('calling createGrant');

		async function validate() {
			setLoading(true)
			// console.log('calling validate');
			// console.log(data);
			try {
				// const updateTransaction = await workspaceRegistryContract.updateWorkspaceMembers(
				// 	workspace!.id,
				// 	data.memberAddress,
				// 	data.memberRoles,
				// 	data.memberRolesEnabled,
				// 	data.memberEmail,
				// )
				// const updateTransactionData = await updateTransaction.wait()
				if(!biconomyWalletClient || typeof biconomyWalletClient === 'string' || !scwAddress) {
					return
				}

				const targetContractObject = new ethers.Contract(
					WORKSPACE_REGISTRY_ADDRESS[currentChainId],
					WorkspaceRegistryAbi,
					webwallet
				)

				const transactionHash = await sendGaslessTransaction(
					biconomy,
					targetContractObject,
					'createWorkspace',
					[workspace!.id,
						data.memberAddress,
						data.memberRoles,
						data.memberRolesEnabled,
						data.memberEmail, ],
					WORKSPACE_REGISTRY_ADDRESS[currentChainId],
					biconomyWalletClient,
					scwAddress,
					webwallet,
					`${currentChainId}`,
					webHookId,
					nonce
				)

				const updateTransactionData = await getTransactionReceipt(transactionHash, currentChainId.toString())

				setTransactionData(updateTransactionData)
				setLoading(false)
			} catch(e: any) {
				const message = getErrorMessage(e)
				setError(message)
				setLoading(false)
				toastRef.current = toast({
					position: 'top',
					render: () => ErrorToast({
						content: message,
						close: () => {
							if(toastRef.current) {
								toast.close(toastRef.current)
							}
						},
					}),
				})
			}
		}

		try {

			if(!data) {
				return
			}

			if(transactionData) {
				return
			}

			if(!accountData || !accountData.address) {
				throw new Error('not connected to wallet')
			}

			if(!workspace) {
				throw new Error('not connected to workspace')
			}

			if(!currentChainId) {
				if(switchNetwork && chainId) {
					switchNetwork(chainId)
				}

				setIncorrectNetwork(true)
				setLoading(false)
				return
			}

			if(chainId !== currentChainId) {
				if(switchNetwork && chainId) {
					switchNetwork(chainId)
				}

				setIncorrectNetwork(true)
				setLoading(false)
				return
			}

			if(
				!workspaceRegistryContract
				|| workspaceRegistryContract.address === '0x0000000000000000000000000000000000000000'
				|| !workspaceRegistryContract.signer
				|| !workspaceRegistryContract.provider
			) {
				return
			}

			validate()
		} catch(e: any) {
			const message = getErrorMessage(e)
			setError(message)
			setLoading(false)
			toastRef.current = toast({
				position: 'top',
				render: () => ErrorToast({
					content: message,
					close: () => {
						if(toastRef.current) {
							toast.close(toastRef.current)
						}
					},
				}),
			})
		}

	}, [
		error,
		loading,
		toast,
		transactionData,
		workspaceRegistryContract,
		workspace,
		accountData,
		networkData,
		currentChainId,
		data,
		chainId,
		incorrectNetwork,
	])

	return [
		transactionData,
		getExplorerUrlForTxHash(currentChainId, transactionData?.transactionHash),
		loading,
	]
}
