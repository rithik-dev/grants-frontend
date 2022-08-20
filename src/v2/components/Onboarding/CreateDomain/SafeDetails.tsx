import { ChangeEventHandler } from 'react'
import { Box, Button, CircularProgress, Flex, Image, Text } from '@chakra-ui/react'
import TextField from '../../InputFields/TextField'
import SafeSelect, { SafeSelectOption } from './SafeSelect'

interface Props {
	safesOptions: SafeSelectOption[];
	step: number;
	safeAddress: string;
	isPasted?: boolean;
	isVerified?: boolean;
	isLoading?: boolean;
	safeSelected: SafeSelectOption;
	onSelectedSafeChange: (e: SafeSelectOption) => void;
	onChange: ChangeEventHandler<HTMLInputElement>;
	onContinue: () => void;
}

function SafeDetails({ safesOptions, step, safeAddress, isPasted, isVerified, isLoading, safeSelected, onChange, onSelectedSafeChange, onContinue }: Props) {
	return (
		<>
			<Text
				variant="v2_body"
				color="black.3">
				Let’s begin the adventure.
			</Text>
			<Text
				variant="v2_heading_3"
				fontWeight="500">
				Create a domain
			</Text>
			<Text
				variant="v2_body"
				fontWeight="500"
				mt={6}>
				To create a domain, you need a safe.
			</Text>
			<Box mb="10" />
			<TextField
				label='Safe Address'
				helperText='Your safe can be used to invite members & do payouts on Questbook.'
				helperLinkText='Learn about safe and supported safes'
				helperLinkUrl='https://youtube.com'
				placeholder='0xE6379586E5D8350038E9126c5553c0C77549B6c3'
				value={safeAddress}
				onChange={onChange}
				isPasted={isPasted}
				isVerified={isVerified}
				isDisabled={step === 1}
			/>
			{
				isLoading && (
					<Flex
						mt={2}
						align="center">
						<CircularProgress
							color="violet.2"
							size="11px"
							isIndeterminate />
						<Text
							ml={2}
							variant="v2_metadata"
							color="black.3">
							Looking up safes with this address on different networks...
						</Text>
					</Flex>
				)
			}
			{step === 1 && <Box mt={6} />}
			{
				step === 1 && (
					<SafeSelect
						safesOptions={safesOptions}
						label="Safes Found"
						helperText="Associated with this address on all networks."
						helperLinkText="Learn about supported networks"
						helperLinkUrl='https://youtube.com'
						value={safeSelected}
						onChange={
							(safeSelected: SafeSelectOption | undefined) => {
								if(safeSelected) {
									onSelectedSafeChange(safeSelected)
								}
							}
						} />
				)
			}
			<Box m='auto' />
			<Button
				variant="primaryV2"
				ml="auto"
				mt={6}
				rightIcon={<Image src={`/ui_icons/arrow-right-fill${!isVerified ? '-disabled' : ''}.svg`} />}
				disabled={!isVerified}
				onClick={onContinue}>
				Continue
			</Button>
		</>
	)
}

export default SafeDetails