import { Button, StyleSheet, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { Axios } from 'axios';
// import { assertStatusValuesInBounds } from 'expo-av/build/AV';
// import { Sound } from 'react-native-sound';
// registerRootComponenet(App);

export default function App() {
	const [recording, setRecording] = useState();
	const [permissionsResponse, requestPermission] = Audio.usePermissions();
	const [inputValue, setInputValue] = useState('');
	const [valorAudioApi, setValorAudioApi] = useState('');
	const [sound, setSound] = useState(null);

	async function playSound() {
		console.log(valorAudioApi);

		const { sound } = await Audio.Sound.createAsync(
			{
				uri: valorAudioApi,
			},
			{
				shouldPlay: true,
			},
		);

		await sound.playAsync();
	}

	async function getParamsText() {
		try {
			const url = `http://192.168.19.157:5041/api/Speech/TextToSpeech?text=${encodeURIComponent(
				inputValue,
			)}`;

			const retorno = await fetch(url);
			const audio = await retorno.text();
			console.log(audio);
			// .then((response) =>
			// 	response.json(),
			// );
			// .then((data) => console.log(data));
			console.log(retorno);
			// const teste = await JSON.parse(retorno.data);
			setValorAudioApi(audio);
			// console.log(teste);
		} catch (error) {
			console.log(error);
		}
	}
	async function speechToText() {
		const form = new FormData();
		form.append('Arquivo', {
			uri: sound,
			name: 'audio/wav',
		});
	}

	// async function getTextToSpeech() {
	// 	const url = `https://192.168.19.157:7225/api/Speech/TextToSpeech?text=${encodeURIComponent(
	// 		inputValue,
	// 	)}`;

	// 	try {
	// 		const response = await fetch(form, {
	// 			headers: {
	// 				'Content-Type': 'multipart/form-data',
	// 			},
	// 		});
	// 		const form = new FormData();
	// 		form.append('Arquivo', {
	// 			uri: url,
	// 			name: `audio/wav`,
	// 			type: `audio/wav`,
	// 		});
	// 	} catch (error) {}
	// }

	async function _askForPermission() {
		if (permissionsResponse.status !== 'granted') {
			console.log('requesting permission');

			await requestPermission();
		}
	}
	useEffect(() => {
		playSound(url);
	}, [valorAudioApi]);

	const url = valorAudioApi;

	async function startRecording() {
		try {
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});
			console.log('Starting Recording');
			const { recording } = await Audio.Recording.createAsync(
				(Audio.RecordingOptionsPresets.HIGH_QUALITY = {
					isMeteringEnabled: true,
					android: {
						extension: '.mp3',
						outputFormat:
							AndroidOutputFormat.MP3,
						audioEncoder:
							AndroidAudioEncoder.AAC,
					},
					ios: {
						extension: '.mp3',
						outputFormat:
							IOSOutputFormat.MP3,
						audioQuality:
							IOSAudioQuality.MAX,
						sampleRate: 44100,
						numberOfChannels: 2,
						bitRate: 128000,
						linearPCMBitDepth: 16,
						linearPCMIsBigEndian: false,
						linearPCMIsFloat: false,
					},
					web: {
						mimeType: 'audio/webm',
						bitsPerSecond: 128000,
					},
				}),
			);
			setRecording(recording);
			console.log('Recording Started');
		} catch (error) {
			console.log('Failed to start recording', error);
		}
	}
	async function stopRecording() {
		console.log('Stopping Recoder..');
		setRecording(undefined);
		await recording.stopAndUnloadAsync();
		await Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
		});

		const uri = recording.getURI();
		setSound(uri);
		console.log('Recording stopped and stored at', uri);
	}

	useEffect(() => {
		_askForPermission();
	});
	return (
		<View style={styles.container}>
			<TextInput
				placeholder="Informe alguma coisa"
				value={inputValue}
				onChangeText={setInputValue}
				style={styles.inputStyle}
			/>
			<Button
				title="Enviar texto"
				onPress={() => getParamsText()}
			/>

			<Button
				title={recording ? 'Stop' : 'Start'}
				onPress={
					recording
						? stopRecording
						: startRecording
				}
			/>
			{/* <Button title="teste" onPress={() => playSound(url)} /> */}
			{/* <StatusBar style="auto" /> */}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputStyle: {
		padding: 10,
		borderWidth: 1,
		width: '90%',
		marginBottom: 20,
	},

	button: {},
});
