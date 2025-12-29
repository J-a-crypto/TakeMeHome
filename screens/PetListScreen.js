import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Button } from 'react-native';
import { PetsContext } from '../context/PetContext';
import Header from '../components/Header';

export default function PetListScreen({ navigation }) {
    const { state, dispatch } = useContext(PetsContext);
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [petName, setPetName] = useState('');
    const [daysLeft, setDaysLeft] = useState(null);

    // Show starter pet modal immediately if pendingAdoption exists
    useEffect(() => {
        if (state.pendingAdoption) {
            setShowNamingModal(true);
        }
    }, [state.pendingAdoption]);



    useEffect(() => {
        if (!state.nextRandomPetSpawn) {
            setDaysLeft(null);
            return;
        }

        const update = () => {

            const msLeft = Math.max(
                0,
                state.nextRandomPetSpawn - Date.now()
            );
            setDaysLeft(
                (msLeft / (24 * 60 * 60 * 1000)).toFixed(2)
            );
        };

        update();
        const i = setInterval(update, 1000);
        return () => clearInterval(i);
    }, [state.nextRandomPetSpawn]);


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
            <Text style={styles.countdown}> Your CounDown:
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
    container: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#ffaf0' },
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
