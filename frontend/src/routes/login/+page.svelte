<svelte:head>
  <title>Sign in · AMC Math Engine</title>
  <meta name="description" content="Access the AMC Math Engine prototype." />
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { apiFetch, type AuthResponse } from '$lib/api';
  import { authStore, setAuth } from '$lib/stores/auth';

  type Mode = 'login' | 'register';

  let mode: Mode = 'login';
  let email = '';
  let password = '';
  let displayName = '';
  let loading = false;
  let errorMessage = '';

  onMount(() => {
    const current = get(authStore);
    if (current) {
      void goto('/dashboard');
    }
  });

  function switchMode(nextMode: Mode) {
    mode = nextMode;
    errorMessage = '';
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMessage = '';
    loading = true;

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : {
              email,
              password,
              displayName: displayName.trim() ? displayName.trim() : undefined,
            };

      const response = await apiFetch<AuthResponse>(endpoint, {
        method: 'POST',
        body: payload,
      });

      setAuth(response);
      await goto('/dashboard');
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Authentication failed.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
  <header class="text-center">
    <p class="text-xs uppercase tracking-[0.3em] text-indigo-500">AMC Math Engine</p>
    <h1 class="mt-3 text-3xl font-semibold text-slate-900">
      {mode === 'login' ? 'Welcome back' : 'Create your account'}
    </h1>
    <p class="mt-2 text-sm text-slate-600">
      {mode === 'login'
        ? 'Sign in to continue your problem-solving journey.'
        : 'Register to unlock guided problem paths and track progress.'}
    </p>
  </header>

  <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium">
      <button
        type="button"
        class="flex-1 rounded-full px-3 py-2 transition"
        class:selected={mode === 'login'}
        on:click={() => switchMode('login')}
      >
        Sign in
      </button>
      <button
        type="button"
        class="flex-1 rounded-full px-3 py-2 transition"
        class:selected={mode === 'register'}
        on:click={() => switchMode('register')}
      >
        Register
      </button>
    </div>

    <form class="mt-8 space-y-5" on:submit={handleSubmit}>
      <label class="block text-sm font-medium text-slate-700">
        Email address
        <input
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          required
        />
      </label>

      <label class="block text-sm font-medium text-slate-700">
        Password
        <input
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          type="password"
          bind:value={password}
          placeholder="At least 8 characters"
          required
          minlength="8"
        />
      </label>

      {#if mode === 'register'}
        <label class="block text-sm font-medium text-slate-700">
          Display name
          <input
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            type="text"
            bind:value={displayName}
            placeholder="Optional"
            maxlength="50"
          />
        </label>
      {/if}

      {#if errorMessage}
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {errorMessage}
        </p>
      {/if}

      <button
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  </div>

  <p class="mt-6 text-center text-sm text-slate-500">
    Your credentials are stored securely with hashed passwords. Tokens are kept in your browser for this prototype.
  </p>
</div>

<style>
  button.selected {
    background: white;
    color: #312e81;
    box-shadow: 0 1px 3px rgb(15 23 42 / 0.1);
  }
</style>
