export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Rede Social
      </h1>
      <p className="max-w-md text-base text-muted-foreground">
        Rede social simples — publicar, curtir e comentar. MVP em construção.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="/cadastro"
          className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Criar conta
        </a>
        <a
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          Entrar
        </a>
      </div>
    </main>
  );
}
