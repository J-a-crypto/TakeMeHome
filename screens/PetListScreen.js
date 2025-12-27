import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Button } from 'react-native';
import { PetsContext } from '../context/PetContext';
import Header from '../components/Header';
import { deleteGame } from '../utils/storage';

export default function PetListScreen({ navigation }) {
    const { state, dispatch } = useContext(PetsContext);
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [petName, setPetName] = useState('');
    const [daysLeft, setDaysLeft] = useState(null);

    // Show starter pet modal immediately if pendingAdoption exists
    useEffect(() => {
        if (state.pendingAdoption && state.pets.length === 0) {
            console.log("Showing starter pet naming modal for:", state.pendingAdoption.species);
            setShowNamingModal(true);
        }
    }, [state.pendingAdoption, state.pets]);

    useEffect(() => {
        if (!state.nextRandomPetSpawn || state.pets.length === 0) return;

        const updateCountdown = () => {
            const msLeft = state.nextRandomPetSpawn - Date.now();
            const days = msLeft / (24 * 60 * 60 * 1000);
            setDaysLeft(days > 0 ? days.toFixed(2) : 0);
        };

        updateCountdown(); // set immediately

        // Optional: update every hour if you want live countdown
        const interval = setInterval(updateCountdown, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [state.nextRandomPetSpawn, state.pets]);



    const handleResetGame = async () => {
        await deleteGame();           // remove saved data
        dispatch({ type: 'CREATE_STARTER_PET' }); // reset context for starter pet
        console.log('Game reset! Starter pet ready.');
    };

    const handleAdopt = () => {
        if (!petName) return alert('Please enter a name!');
        console.log("Adopting pet with name:", petName);
        dispatch({ type: 'ADOPT_PET', payload: { name: petName } });
        setPetName('');
        setShowNamingModal(false);
    };

    return (
        <View style={styles.container}>
            <Header title="PetList" onBack={() => navigation.navigate("Home")} />
            <Text style={styles.title}>Your Pets</Text>
            <Text style={styles.countdown}>
                {daysLeft !== null && daysLeft > 0
                    ? `Next random pet (${state.nextRandomPetTemplate?.species}) in ${daysLeft} days`
                    : ''}
            </Text>


            {state.pets.length === 0 ? (
                <Text>No pets yet!</Text>
            ) : (
                state.pets.map(pet => (
                    <TouchableOpacity
                        key={pet.id}
                        style={styles.petShow}
                        onPress={() => navigation.navigate('PetHome', { petId: pet.id })}
                    >
                        <Image source={pet.image} style={{ width: 200, height: 200 }} />
                        <Text style={styles.petStat}>{pet.name} the {pet.species}</Text>
                    </TouchableOpacity>
                ))
            )}
            <Button title="Reset Game (Dev)" onPress={handleResetGame} />


            {/* Adoption Modal */}
            {state.pendingAdoption && showNamingModal && (
                <Modal
                    visible={showNamingModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => { }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Meet your new {state.pendingAdoption.species}!
                            </Text>
                            <Text>Name your pet:</Text>
                            <TextInput
                                style={styles.input}
                                value={petName}
                                onChangeText={setPetName}
                                placeholder="Pet Name"
                            />
                            <Button title="Adopt" onPress={handleAdopt} />
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#ffaf0' },
    title: { fontSize: 22, marginTop: 12, fontWeight: '700' },
    petShow: {
        marginVertical: 10,
        backgroundColor: '#ff6f61',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        padding: 15,
    },
    petStat: { fontSize: 18, color: '#fff', fontWeight: '600', marginTop: 10, textAlign: 'center' },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    input: { borderWidth: 1, width: '100%', padding: 10, marginVertical: 10, borderRadius: 5 },
    countdown: {
        fontSize: 16,
        marginVertical: 10,
        color: '#333',
    },

});
