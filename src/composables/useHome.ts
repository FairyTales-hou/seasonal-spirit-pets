import { computed } from 'vue'
import { useHomeStore } from '@/store/home'
import { PETS } from '@/mock/pets'
import { INTERACTION_FEEDBACK, MINE_ACTIONS } from '@/mock/home'
import { getSolarTermContent } from '@/mock/solar-term-content'

export function useHome() {
  const homeStore = useHomeStore()

  const homeData = computed(() => homeStore.homeData)
  const favoritePetIds = computed(() => homeStore.favoritePetIds)
  const getPetById = (petId?: string) => PETS.find((pet) => pet.id === petId)
  const currentPet = computed(() => getPetById(homeData.value.petId) ?? PETS[0])
  const unlockedPets = computed(() => PETS.filter((pet) => pet.unlocked || pet.id === homeData.value.petId))
  const favoritePets = computed(() => PETS.filter((pet) => favoritePetIds.value.includes(pet.id)))
  const currentTermContent = computed(() => getSolarTermContent(homeData.value.petId))
  const isFavoritePet = (petId: string) => homeStore.isFavoritePet(petId)

  return {
    homeData,
    favoritePetIds,
    favoritePets,
    currentPet,
    getPetById,
    isFavoritePet,
    pets: PETS,
    unlockedPets,
    detailedSuggestions: computed(() => currentTermContent.value.detailedSuggestions),
    knowledgeCards: computed(() => currentTermContent.value.knowledgeCards),
    interactionFeedback: INTERACTION_FEEDBACK,
    mineActions: MINE_ACTIONS,
    interact: homeStore.interact,
    toggleFavoritePet: homeStore.toggleFavoritePet,
  }
}
