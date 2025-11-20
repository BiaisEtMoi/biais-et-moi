<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import {
		SEXE_OPTIONS,
		AGE_RANGE,
		PROFESSION_OPTIONS,
		TYPE_POSTE_OPTIONS,
		SPECIALITES,
		STRUCTURE_OPTIONS,
		REGIONS,
		ORIGINE_ETHNIQUE_OPTIONS
	} from './field-values';
  import { getIdentityFromStorage, STORAGE_KEY } from './identity.storage';


	// Initialize form data from localStorage if available
	const initialFormData = browser 
		? getIdentityFromStorage() ?? {
			sexe: '',
			age: '',
			profession: '',
			typePoste: '',
			specialite: '',
			structure: '',
			region: '',
			origineEthnique: '',
			valid: false
		}
		: {
			sexe: '',
			age: '',
			profession: '',
			typePoste: '',
			specialite: '',
			structure: '',
			region: '',
			origineEthnique: '',
			valid: false
		};

	let formData = $state(initialFormData);

	// Save to localStorage whenever formData changes
	$effect(() => {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		formData.valid = true;
		// Form data is already saved in localStorage via $effect
		goto('/iat');
	}

	function handleClear() {
		formData = {
			sexe: '',
			age: '',
			profession: '',
			typePoste: '',
			specialite: '',
			structure: '',
			region: '',
			origineEthnique: '',
			valid: false
		};
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	// Check if form is valid
	const isFormValid = $derived(() => {
		const baseFields = formData.sexe && formData.age && formData.profession && 
			formData.structure && formData.region && formData.origineEthnique;
		
		// If profession is médecin, also require typePoste and specialite
		if (formData.profession === 'medecin') {
			return baseFields && formData.typePoste && formData.specialite;
		}
		
		return baseFields;
	});
</script>

<main>
	<div class="container">
		<h1>Informations personnelles</h1>
		<p class="intro">
			Ces informations sont anonymes et serviront uniquement à analyser les résultats du test.
		</p>

		<form onsubmit={handleSubmit}>
			<!-- Sexe -->
			<div class="form-group">
				<label for="sexe">Sexe *</label>
				<select id="sexe" bind:value={formData.sexe} required>
					<option value="">Sélectionnez</option>
					{#each SEXE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Age -->
			<div class="form-group">
				<label for="age">Âge *</label>
				<select id="age" bind:value={formData.age} required>
					<option value="">Sélectionnez</option>
					{#each Array.from({ length: AGE_RANGE.max - AGE_RANGE.min + 1 }, (_, i) => i + AGE_RANGE.min) as age}
						<option value={age}>{age} ans</option>
					{/each}
				</select>
			</div>

			<!-- Profession -->
			<div class="form-group">
				<label for="profession">Profession *</label>
				<select id="profession" bind:value={formData.profession} required>
					<option value="">Sélectionnez</option>
					{#each PROFESSION_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Type de poste (only if médecin) -->
			{#if formData.profession === 'medecin'}
				<div class="form-group">
					<label for="typePoste">Type de poste *</label>
					<select id="typePoste" bind:value={formData.typePoste} required>
						<option value="">Sélectionnez</option>
						{#each TYPE_POSTE_OPTIONS as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Spécialité (only if médecin) -->
				<div class="form-group">
					<label for="specialite">Spécialité *</label>
					<select id="specialite" bind:value={formData.specialite} required>
						<option value="">Sélectionnez</option>
						{#each SPECIALITES as specialite}
							<option value={specialite}>{specialite}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Structure -->
			<div class="form-group">
				<label for="structure">Structure dans laquelle vous travaillez *</label>
				<select id="structure" bind:value={formData.structure} required>
					<option value="">Sélectionnez</option>
					{#each STRUCTURE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Région -->
			<div class="form-group">
				<label for="region">Région dans laquelle vous travaillez *</label>
				<select id="region" bind:value={formData.region} required>
					<option value="">Sélectionnez</option>
					{#each REGIONS as region}
						<option value={region}>{region}</option>
					{/each}
				</select>
			</div>

			<!-- Origine ethnique -->
			<div class="form-group">
				<label for="origineEthnique">Origine ethnique *</label>
				<select id="origineEthnique" bind:value={formData.origineEthnique} required>
					<option value="">Sélectionnez</option>
					{#each ORIGINE_ETHNIQUE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="button-container">
				<button type="button" class="clear-button" onclick={handleClear}>Effacer</button>
				<button type="submit" class="submit-button" disabled={!isFormValid()}>Faire le test</button>
			</div>
		</form>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		padding: 2rem;
		min-height: 100vh;
		background-color: #f9f9f9;
	}

	.container {
		max-width: 600px;
		width: 100%;
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin: 2rem 0;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.intro {
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: #333;
		font-size: 0.95rem;
	}

	select {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		background-color: white;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}

	select:hover {
		border-color: #999;
	}

	select:focus {
		outline: none;
		border-color: #ff3e00;
		box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
	}

	.button-container {
		margin-top: 1rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.submit-button {
		padding: 1rem 3rem;
		background-color: #ff3e00;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.submit-button:hover {
		background-color: #cc3200;
	}

	.submit-button:active {
		transform: translateY(1px);
	}

	.submit-button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.submit-button:disabled:hover {
		background-color: #ccc;
		transform: none;
	}

	.clear-button {
		padding: 1rem 2rem;
		background-color: #6c757d;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.clear-button:hover {
		background-color: #5a6268;
	}

	.clear-button:active {
		transform: translateY(1px);
	}
</style>
