import {
  Box, Button, Center, CircularProgress, Flex, Text, Image, Link,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import CoverUpload from '../ui/forms/coverUpload';
import ImageUpload from '../ui/forms/imageUpload';
import MultiLineInput from '../ui/forms/multiLineInput';
import SingleLineInput from '../ui/forms/singleLineInput';
import supportedNetworks from '../../constants/supportedNetworks.json';

function EditForm({
  onSubmit: onFormSubmit,
  formData,
  hasClicked,
}: {
  onSubmit: (data: {
    name: string;
    about: string;
    image?: File;
    coverImage?: File;
    twitterHandle?: string;
    discordHandle?: string;
    telegramChannel?: string;
  }) => void;
  formData: any;
  hasClicked: boolean;
}) {
  const [daoName, setDaoName] = React.useState('');
  const [daoNameError, setDaoNameError] = React.useState(false);

  const [daoAbout, setDaoAbout] = React.useState('');
  const [daoAboutError, setDaoAboutError] = React.useState(false);

  const [supportedNetwork, setSupportedNetwork] = React.useState('');

  const [image, setImage] = React.useState<string | null>('');
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const [coverImage, setCoverImage] = React.useState<string | null>('');
  const [coverImageFile, setCoverImageFile] = React.useState<File | null>(null);

  const [twitterHandle, setTwitterHandle] = React.useState('');
  const [twitterHandleError, setTwitterHandleError] = React.useState(false);

  const [discordHandle, setDiscordHandle] = React.useState('');
  const [discordHandleError, setDiscordHandleError] = React.useState(false);

  const [telegramChannel, setTelegramChannel] = React.useState('');
  const [telegramChannelError, setTelegramChannelError] = React.useState(false);

  useEffect(() => {
    if (!formData) {
      return;
    }
    const chainId = formData.supportedNetwork.split('_')[1];
    const supportedChainIds = Object.keys(supportedNetworks);
    const networkSupported = supportedChainIds.includes(chainId);
    const networkName = networkSupported
      ? supportedNetworks[chainId as keyof typeof supportedNetworks].name
      : 'Unsupported Network';
    setDaoName(formData.name);
    setDaoAbout(formData.about);
    setSupportedNetwork(networkName);
    setImage(formData.image);
    setCoverImage(formData.coverImage);
    setTwitterHandle(formData.twitterHandle);
    setDiscordHandle(formData.discordHandle);
    setTelegramChannel(formData.telegramChannel);
  }, [formData]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setImageFile(img);
      setImage(URL.createObjectURL(img));
    }
  };

  const handleCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setCoverImageFile(img);
      setCoverImage(URL.createObjectURL(img));
    }
  };

  const handleSubmit = () => {
    let error = false;
    if (!daoName || daoName.length === 0) {
      setDaoNameError(true);
      error = true;
    }
    if (!daoAbout || daoAbout.length === 0) {
      setDaoAboutError(true);
      error = true;
    }

    if (!error) {
      onFormSubmit({
        name: daoName,
        about: daoAbout,
        image: imageFile!,
        coverImage: coverImageFile!,
        twitterHandle,
        discordHandle,
        telegramChannel,
      });
    }
  };

  return (
    <>
      <Flex w="100%" mt={8} alignItems="flex-start">
        <SingleLineInput
          label="Grants DAO Name"
          placeholder="Nouns DAO"
          subtext="Letters, spaces, and numbers are allowed."
          value={daoName}
          onChange={(e) => {
            if (daoNameError) setDaoNameError(false);
            setDaoName(e.target.value);
          }}
          isError={daoNameError}
        />
        <Box ml={9} />
        <ImageUpload
          image={image}
          isError={false}
          onChange={handleImageChange}
          onClear={() => setImage(null)}
          label="Add a logo"
          subtext="Upload"
        />
      </Flex>
      <Flex w="100%" mt={1}>
        <MultiLineInput
          label="About your Grants DAO"
          placeholder="Sample"
          value={daoAbout}
          onChange={(e) => {
            if (daoAboutError) setDaoAboutError(false);
            setDaoAbout(e.target.value);
          }}
          isError={daoAboutError}
          maxLength={500}
          subtext={null}
        />
      </Flex>
      <Flex w="100%" mt={1}>
        <SingleLineInput
          label="Network"
          placeholder="Network"
          value={supportedNetwork}
          onChange={() => {}}
          isError={false}
          disabled
        />
      </Flex>
      <Flex w="100%" mt={10}>
        <CoverUpload
          image={coverImage}
          isError={false}
          onChange={handleCoverImageChange}
          subtext="Upload a cover"
        />
      </Flex>
      <Flex w="100%" mt={8} alignItems="flex-start">
        <SingleLineInput
          label="Twitter Handle"
          placeholder="@ethereum"
          subtext=""
          value={twitterHandle}
          onChange={(e) => {
            if (twitterHandleError) setTwitterHandleError(false);
            setTwitterHandle(e.target.value);
          }}
          isError={twitterHandleError}
        />
      </Flex>
      <Flex w="100%" mt={8} alignItems="flex-start">
        <SingleLineInput
          label="Discord Server Link"
          placeholder="@ethereum"
          subtext=""
          value={discordHandle}
          onChange={(e) => {
            if (discordHandleError) setDiscordHandleError(false);
            setDiscordHandle(e.target.value);
          }}
          isError={discordHandleError}
        />
      </Flex>
      <Flex w="100%" mt={8} alignItems="flex-start">
        <SingleLineInput
          label="Telegram Channel"
          placeholder="www.telegram.com"
          subtext=""
          value={telegramChannel}
          onChange={(e) => {
            if (telegramChannelError) setTelegramChannelError(false);
            setTelegramChannel(e.target.value);
          }}
          isError={telegramChannelError}
        />
      </Flex>
      <Flex direction="row" mt={4}>
        <Text textAlign="left" variant="footer" fontSize="12px">
          <Image display="inline-block" src="/ui_icons/info.svg" alt="pro tip" mb="-2px" />
          {' '}
          By pressing the button Save Changes below
          you&apos;ll have to approve this transaction in your wallet.
          {' '}
          <Link href="https://www.notion.so/questbook/FAQs-206fbcbf55fc482593ef6914f8e04a46" target="_blank">Learn more</Link>
          {' '}
          <Image
            display="inline-block"
            src="/ui_icons/link.svg"
            alt="pro tip"
            mb="-1px"
            h="10px"
            w="10px"
          />
        </Text>
      </Flex>

      <Flex direction="row" justify="start" mt={4}>
        {hasClicked ? (
          <Center>
            <CircularProgress isIndeterminate color="brand.500" size="48px" mt={4} />
          </Center>
        ) : (
          <Button variant="primary" onClick={handleSubmit}>
            Save changes
          </Button>
        )}
      </Flex>
    </>
  );
}

export default EditForm;
